#!/usr/bin/env python3
"""Parse ISTQB CTFL sample exam PDFs into a structured JSON bank.

Reads pdftotext -layout output for the Brazilian-Portuguese question and
answer PDFs (Exam A + Appendix and Exam B) and writes
`quiz/src/data/questions.json`.
"""

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
PDF_DIR = Path("/root/.claude/uploads/40af5b37-507c-4648-ace3-da684c56a206")

PDFS = {
    "A_q": "deae989a-ISTQB_CTFL_v4.0_SampleExamAQuestions_v1.7BR.pdf",
    "A_a": "6f0cf231-ISTQB_CTFL_v4.0_SampleExamAAnswers_v1.7BR.pdf",
    "B_q": "3a673614-ISTQB_CTFL_v4.0_SampleExamBQuestions_v1.7BR.pdf",
    "B_a": "9afed98d-ISTQB_CTFL_v4.0_SampleExamBAnswers_v1.7BR.pdf",
}

# Hardcoded answer keys extracted from the answer PDFs. Each entry has the
# correct letters and the learning-objective code (used to derive chapter).
EXAM_A_KEY = {
    1: ("c", "FL-1.1.1"), 2: ("a", "FL-1.2.1"), 3: ("a", "FL-1.3.1"),
    4: ("b", "FL-1.4.1"), 5: ("b", "FL-1.4.2"), 6: ("a,e", "FL-1.4.5"),
    7: ("b", "FL-1.5.1"), 8: ("d", "FL-1.5.2"), 9: ("d", "FL-2.1.2"),
    10: ("c", "FL-2.1.3"), 11: ("d", "FL-2.1.5"), 12: ("c", "FL-2.1.6"),
    13: ("a", "FL-2.2.1"), 14: ("b", "FL-2.2.3"), 15: ("a", "FL-3.1.2"),
    16: ("d", "FL-3.2.1"), 17: ("b", "FL-3.2.4"), 18: ("d", "FL-3.2.5"),
    19: ("c", "FL-4.1.1"), 20: ("b", "FL-4.2.1"), 21: ("a", "FL-4.2.2"),
    22: ("d", "FL-4.2.3"), 23: ("d", "FL-4.2.4"), 24: ("a", "FL-4.3.1"),
    25: ("d", "FL-4.3.3"), 26: ("a", "FL-4.4.1"), 27: ("c", "FL-4.4.2"),
    28: ("b", "FL-4.5.2"), 29: ("a", "FL-4.5.3"), 30: ("c", "FL-5.1.2"),
    31: ("c,e", "FL-5.1.3"), 32: ("d", "FL-5.1.4"), 33: ("a", "FL-5.1.5"),
    34: ("a", "FL-5.1.7"), 35: ("c", "FL-5.2.4"), 36: ("d", "FL-5.3.3"),
    37: ("c", "FL-5.4.1"), 38: ("c", "FL-5.5.1"), 39: ("c", "FL-6.1.1"),
    40: ("b", "FL-6.2.1"),
}

EXAM_A_APPENDIX_KEY = {
    "A1": ("a", "FL-1.1.2"), "A2": ("d", "FL-1.2.2"), "A3": ("d", "FL-1.2.3"),
    "A4": ("d", "FL-1.4.3"), "A5": ("c", "FL-1.4.4"), "A6": ("d", "FL-1.5.3"),
    "A7": ("b,c", "FL-2.1.1"), "A8": ("c", "FL-2.1.4"), "A9": ("b", "FL-2.2.2"),
    "A10": ("a", "FL-2.3.1"), "A11": ("c", "FL-3.1.1"), "A12": ("d", "FL-3.1.3"),
    "A13": ("b", "FL-3.2.2"), "A14": ("b", "FL-3.2.3"), "A15": ("c", "FL-4.2.2"),
    "A16": ("d", "FL-4.3.2"), "A17": ("c", "FL-4.4.3"), "A18": ("b", "FL-4.5.1"),
    "A19": ("d", "FL-5.1.1"), "A20": ("b", "FL-5.1.4"), "A21": ("a", "FL-5.1.6"),
    "A22": ("c", "FL-5.2.1"), "A23": ("a", "FL-5.2.2"), "A24": ("d", "FL-5.2.3"),
    "A25": ("a,d", "FL-5.3.1"), "A26": ("b", "FL-5.3.2"),
}

EXAM_B_KEY = {
    1: ("d", "FL-1.2.1"), 2: ("b", "FL-1.2.2"), 3: ("d", "FL-1.3.1"),
    4: ("a", "FL-1.4.1"), 5: ("c", "FL-1.4.2"), 6: ("b", "FL-1.4.4"),
    7: ("b", "FL-1.5.1"), 8: ("d", "FL-1.5.2"), 9: ("b", "FL-2.1.1"),
    10: ("b", "FL-2.1.2"), 11: ("a", "FL-2.1.3"), 12: ("b", "FL-2.1.4"),
    13: ("a", "FL-2.2.1"), 14: ("d", "FL-2.2.3"), 15: ("b", "FL-3.1.3"),
    16: ("c", "FL-3.2.1"), 17: ("d", "FL-3.2.2"), 18: ("c", "FL-3.2.3"),
    19: ("d", "FL-4.1.1"), 20: ("a", "FL-4.2.1"), 21: ("d", "FL-4.2.2"),
    22: ("b", "FL-4.2.3"), 23: ("c", "FL-4.2.4"), 24: ("b", "FL-4.3.1"),
    25: ("c", "FL-4.3.2"), 26: ("a,e", "FL-4.4.2"), 27: ("d", "FL-4.4.3"),
    28: ("b", "FL-4.5.2"), 29: ("d", "FL-4.5.3"), 30: ("a", "FL-5.1.3"),
    31: ("b", "FL-5.1.4"), 32: ("b", "FL-5.1.5"), 33: ("d", "FL-5.1.7"),
    34: ("c", "FL-5.2.4"), 35: ("a", "FL-5.3.1"), 36: ("a", "FL-5.3.3"),
    37: ("a", "FL-5.4.1"), 38: ("b", "FL-5.5.1"), 39: ("c", "FL-6.1.1"),
    40: ("a", "FL-6.2.1"),
}

HEADER_RE = re.compile(
    r"^(Vers[ãa]o|©\s|Certified Tester|Set [AB]|Exemplo de Exame|Sample Exam|"
    r"\s*Conselho|Software\s*$|Questões\s*$|Quest[õo]es\s*$|Página)"
)


def is_header_or_footer(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    if HEADER_RE.match(s):
        return True
    if re.match(r"^P[áa]gina\s+\d+\s*de\s*\d+", s):
        return True
    if re.match(r"^Versão\s*1\.\d", s):
        return True
    return False


def extract_text(pdf_path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        capture_output=True, check=True, text=True,
    )
    return result.stdout


def clean_lines(text: str) -> list[str]:
    lines = text.split("\n")
    return [ln for ln in lines if not is_header_or_footer(ln)]


# Pattern for question heading. Handles "Questão 1", "Questão #A1",
# "Questão # A7" (extra space variants seen in the PDFs).
Q_HEADING_RE = re.compile(
    r"^\s*Questão\s+#?\s*(A?\d+)\s*\(\s*\d+\s*ponto.*\)\s*$"
)

# Option marker, "a)", "b)", etc.
OPT_RE = re.compile(r"^\s*([a-e])\s*\)\s*(.*)$")

# Roman-numeral list inside a stem (i, ii, iii, iv, v).
ROMAN_RE = re.compile(r"^\s*(i{1,3}|iv|v)\.\s+(.*)$", re.IGNORECASE)


def parse_question_blocks(lines: list[str], appendix_marker: str | None = None):
    """Iterate over (qid, raw_block_lines) for each question.

    `appendix_marker` if provided is a sentinel line marking the start of
    the appendix section (so we can label appendix questions like A1).
    """
    blocks = []
    cur_id = None
    cur_lines: list[str] = []
    in_appendix = appendix_marker is None  # if no marker, treat all as main
    if appendix_marker is not None:
        in_appendix_state = False
    else:
        in_appendix_state = False

    for line in lines:
        if appendix_marker and appendix_marker in line:
            in_appendix_state = True
            # flush current
            if cur_id is not None:
                blocks.append((cur_id, cur_lines))
                cur_id, cur_lines = None, []
            continue
        m = Q_HEADING_RE.match(line)
        if m:
            if cur_id is not None:
                blocks.append((cur_id, cur_lines))
            qid_raw = m.group(1)
            if qid_raw.startswith("A"):
                cur_id = qid_raw
            else:
                cur_id = qid_raw  # numeric string
            cur_lines = []
            continue
        if cur_id is not None:
            cur_lines.append(line)
    if cur_id is not None:
        blocks.append((cur_id, cur_lines))
    return blocks


SELECT_HINT_RE = re.compile(r"^\s*Selecione\s+(UMA|DUAS)\s+op", re.IGNORECASE)


def parse_block(block_lines: list[str]) -> dict:
    """Split a block into stem, options, and selectCount."""
    stem_lines: list[str] = []
    options: list[dict] = []
    cur_opt: dict | None = None
    select_count = 1

    for raw in block_lines:
        stripped = raw.rstrip()
        sel = SELECT_HINT_RE.match(stripped)
        if sel:
            select_count = 2 if sel.group(1).upper() == "DUAS" else 1
            # stop parsing options here
            if cur_opt is not None:
                options.append(cur_opt)
                cur_opt = None
            # ignore any remaining lines
            break
        m = OPT_RE.match(stripped)
        if m and (cur_opt is None or len(stem_lines) > 0):
            # treat as option start only after we already have stem text
            if cur_opt is not None:
                options.append(cur_opt)
            cur_opt = {"letter": m.group(1), "lines": [m.group(2)]}
            continue
        if cur_opt is not None:
            # continuation of current option (wrapped line)
            if stripped.strip():
                cur_opt["lines"].append(stripped.strip())
        else:
            stem_lines.append(stripped)

    if cur_opt is not None:
        options.append(cur_opt)

    # Compact stem
    stem = "\n".join(stem_lines).strip()
    stem = re.sub(r"\n{3,}", "\n\n", stem)

    cleaned_options = []
    for opt in options:
        text = " ".join(s.strip() for s in opt["lines"] if s.strip())
        text = re.sub(r"\s+", " ", text).strip()
        cleaned_options.append({"letter": opt["letter"], "text": text})

    return {
        "stem": stem,
        "options": cleaned_options,
        "selectCount": select_count,
    }


def chapter_from_lo(lo: str) -> int:
    m = re.match(r"FL-(\d)", lo)
    return int(m.group(1)) if m else 0


def build_question(qid_str: str, exam: str, parsed: dict, key: tuple) -> dict:
    correct = [c.strip() for c in key[0].split(",")]
    lo = key[1]
    return {
        "id": f"{exam}-{qid_str}",
        "exam": exam,
        "number": qid_str,
        "isAppendix": qid_str.startswith("A"),
        "chapter": chapter_from_lo(lo),
        "lo": lo,
        "selectCount": parsed["selectCount"],
        "stem": parsed["stem"],
        "options": parsed["options"],
        "correct": correct,
    }


def main() -> None:
    out_questions = []

    # ---- Exam A ----
    text_a = extract_text(PDF_DIR / PDFS["A_q"])
    lines_a = clean_lines(text_a)
    # find the appendix marker line
    appendix_marker_a = "Apêndice: Perguntas adicionais"
    blocks_a = parse_question_blocks(lines_a, appendix_marker=appendix_marker_a)
    for qid, lns in blocks_a:
        parsed = parse_block(lns)
        if qid.startswith("A"):
            key = EXAM_A_APPENDIX_KEY.get(qid)
        else:
            key = EXAM_A_KEY.get(int(qid))
        if key is None:
            print(f"WARN: no key for A-{qid}")
            continue
        out_questions.append(build_question(qid, "A", parsed, key))

    # ---- Exam B ----
    text_b = extract_text(PDF_DIR / PDFS["B_q"])
    lines_b = clean_lines(text_b)
    blocks_b = parse_question_blocks(lines_b, appendix_marker=None)
    for qid, lns in blocks_b:
        parsed = parse_block(lns)
        if qid.startswith("A"):
            print(f"WARN: unexpected appendix question in exam B: {qid}")
            continue
        key = EXAM_B_KEY.get(int(qid))
        if key is None:
            print(f"WARN: no key for B-{qid}")
            continue
        out_questions.append(build_question(qid, "B", parsed, key))

    out_dir = ROOT / "quiz" / "src" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "questions.json"
    out_path.write_text(
        json.dumps(out_questions, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    counts = {}
    for q in out_questions:
        bucket = ("Exame A", "Apêndice A", "Exame B")[
            0 if (q["exam"] == "A" and not q["isAppendix"])
            else 1 if q["exam"] == "A" else 2
        ]
        counts[bucket] = counts.get(bucket, 0) + 1
    print(f"Wrote {len(out_questions)} questions to {out_path}")
    for k, v in counts.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
