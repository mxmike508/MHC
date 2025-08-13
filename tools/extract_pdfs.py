import sys, os, math
import pdfplumber

CHUNK_SIZE = 12000  # characters per chunk to keep files AI-friendly

def clean(text: str) -> str:
    if not text:
        return ""
    lines = [ln.strip() for ln in text.splitlines()]
    return "\n".join(ln for ln in lines if ln)

def extract_pdf_to_text(pdf_path: str) -> str:
    out = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            txt = clean(page.extract_text() or "")
            if txt:
                out.append(f"## Page {i}\n\n{txt}\n")
    return "\n".join(out)

def write_markdown_chunks(base_out_path: str, title: str, body: str):
    if not body.strip():
        print(f"WARNING: No extractable text (might be scanned): {base_out_path}")
        return
    header = f"# {title}\n\nSource: {title}.pdf\n\n"
    body = body.strip()
    if len(body) + len(header) <= CHUNK_SIZE:
        with open(base_out_path + ".md", "w", encoding="utf-8") as f:
            f.write(header + body)
        return
    parts = math.ceil(len(body) / CHUNK_SIZE)
    for i in range(parts):
        chunk = body[i*CHUNK_SIZE:(i+1)*CHUNK_SIZE]
        with open(f"{base_out_path}_part{i+1}of{parts}.md", "w", encoding="utf-8") as f:
            f.write(header + chunk)

def main():
    if len(sys.argv) != 3:
        print("Usage: python tools\\extract_pdfs.py <input_pdf_dir> <output_md_dir>")
        sys.exit(1)
    in_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    for root, _, files in os.walk(in_dir):
        for name in files:
            if not name.lower().endswith(".pdf"):
                continue
            pdf_path = os.path.join(root, name)
            rel = os.path.relpath(pdf_path, in_dir)
            base_name = os.path.splitext(os.path.basename(rel))[0]
            subdir = os.path.dirname(rel)
            dest_dir = os.path.join(out_dir, subdir)
            os.makedirs(dest_dir, exist_ok=True)
            out_base = os.path.join(dest_dir, base_name)
            print(f"Extracting: {pdf_path}")
            text = extract_pdf_to_text(pdf_path)
            write_markdown_chunks(out_base, base_name, text)

if __name__ == "__main__":
    main()