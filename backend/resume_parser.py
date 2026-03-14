import os
import fitz
import docx


SUPPORTED_FORMATS = [".pdf", ".docx"]


def parse_pdf(file_path):
    extracted_text = ""
    
    try:
        pdf_document = fitz.open(file_path)
        total_pages = len(pdf_document)
        
        print(f"PDF opened successfully. Total pages: {total_pages}")
        
        for page_number in range(total_pages):
            page = pdf_document[page_number]
            page_text = page.get_text()
            extracted_text += page_text
            print(f"Page {page_number + 1} extracted: {len(page_text)} characters")
        
        pdf_document.close()
        
    except Exception as e:
        raise ValueError(f"Error reading PDF file: {str(e)}")
    
    cleaned_text = clean_text(extracted_text)
    return cleaned_text


def parse_docx(file_path):
    extracted_text = ""
    
    try:
        word_document = docx.Document(file_path)
        all_paragraphs = word_document.paragraphs
        
        print(f"DOCX opened successfully. Total paragraphs: {len(all_paragraphs)}")
        
        for paragraph in all_paragraphs:
            if paragraph.text.strip():
                extracted_text += paragraph.text + "\n"
        
        for table in word_document.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        extracted_text += cell.text + "\n"
    
    except Exception as e:
        raise ValueError(f"Error reading DOCX file: {str(e)}")
    
    cleaned_text = clean_text(extracted_text)
    return cleaned_text


def clean_text(raw_text):
    if not raw_text:
        return ""
    
    lines = raw_text.split("\n")
    cleaned_lines = []
    
    for line in lines:
        stripped_line = line.strip()
        if stripped_line:
            cleaned_lines.append(stripped_line)
    
    final_text = "\n".join(cleaned_lines)
    return final_text


def get_file_extension(file_path):
    filename = os.path.basename(file_path)
    extension = os.path.splitext(filename)[1]
    extension = extension.lower()
    return extension


def parse_resume(file_path):
    print(f"\n--- Starting resume parsing ---")
    print(f"File: {file_path}")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    file_extension = get_file_extension(file_path)
    print(f"File type detected: {file_extension}")
    
    if file_extension not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported file format: {file_extension}. "
            f"Please upload {' or '.join(SUPPORTED_FORMATS)} files only."
        )
    
    if file_extension == ".pdf":
        extracted_text = parse_pdf(file_path)
    elif file_extension == ".docx":
        extracted_text = parse_docx(file_path)
    
    if len(extracted_text) < 50:
        raise ValueError(
            "Resume text too short. "
            "The file might be image-based or corrupted. "
            "Please upload a text-based PDF or DOCX."
        )
    
    print(f"--- Parsing complete! Total characters extracted: {len(extracted_text)} ---\n")
    return extracted_text

if __name__ == "__main__":
    print("=== Testing Resume Parser ===\n")

    # ══════════════════════════════════════════
    # SIRF YE LINE CHANGE KARO — apna PDF naam likho
    # ══════════════════════════════════════════

    PDF_FILE_NAME = "Abhinay_chaudhary_resume.pdf"   # ← YAHAN APNA FILE NAAM LIKHO

    # ══════════════════════════════════════════

    test_file_path = f"uploads/{PDF_FILE_NAME}"

    print(f"File path: {test_file_path}")
    print("-" * 50)

    try:
        result = parse_resume(test_file_path)

        print("\n✅ EXTRACTED TEXT:")
        print("=" * 50)
        print(result)
        print("=" * 50)
        print(f"\n📊 Total characters: {len(result)}")
        print(f"📄 Total lines: {len(result.splitlines())}")
        print("\n✅ Parser working perfectly!")

    except FileNotFoundError:
        print("\n❌ FILE NOT FOUND!")
        print(f"   Looking for: {test_file_path}")
        print("   Fix: PDF file ko backend/uploads/ folder mein rakho")
        print(f"   Aur PDF_FILE_NAME mein exact naam likho")

    except ValueError as e:
        print(f"\n❌ ERROR: {e}")
        print("   Possible reason: PDF image-based hai")
        print("   Fix: Text-based PDF use karo")

    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")