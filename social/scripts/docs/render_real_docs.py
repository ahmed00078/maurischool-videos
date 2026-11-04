"""Render real MauriSchool 1.0.8 documents from the local review database.

Runs the backend's own builders (PDFService.generate_receipt_pdf and the official
report-card context + DocumentRenderer) against real demo records. Only in this
process, the asset loader returns the demo crest and stamp, because the review
environment cannot reach the school's Cloudinary. It writes the demo identity into the REVIEW
school of the local review database: never point it at a real database. Nothing in the repository changes.

usage (from maurischool/backend/, against the review database):
  python render_real_docs.py <out_dir> <crest.png> <seal.png> <payment_id> <official_document_issue_id>
Then export the PDFs' first pages to PNG (img/docs/receipt-fr.png, receipt-ar.png, bulletin.png).
"""
import asyncio
import base64
import copy
import json
import sys
from pathlib import Path

sys.path.insert(0, ".")

from app.core.database import SessionLocal  # noqa: E402
from app.models import School  # noqa: E402
from app.models.term_closing import OfficialDocumentIssue  # noqa: E402
from app.services.documents import DocumentRenderer, core  # noqa: E402
from app.services.official_document_service import OfficialDocumentService  # noqa: E402
from app.services.pdf_service import PDFService  # noqa: E402

out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
uri = lambda p: "data:image/png;base64," + base64.b64encode(Path(p).read_bytes()).decode()
ASSETS = {"demo://crest": uri(sys.argv[2]), "demo://seal": uri(sys.argv[3])}
core.SafeDocumentAssetLoader.as_data_uri = lambda self, url: ASSETS.get(url) if url else None

db = SessionLocal()
school = db.query(School).filter(School.code == "REVIEW").one()
settings = copy.deepcopy(school.settings or {})
settings.setdefault("branding", {}).update({"logo_url": "demo://crest", "primary_color": "#1E6B47", "display_name_fr": "Complexe Scolaire Al Nour", "display_name_ar": "مجمع النور المدرسي"})
settings.setdefault("documents", {}).update({
    "show_logo": True, "stamp_url": "demo://seal",
    "official_include_stamp": True, "official_include_signature": True,
    "financial_include_stamp": True, "financial_include_signature": True,
    "motto_fr": "Savoir · Discipline · Réussite", "motto_ar": "علم · انضباط · نجاح",
    "header_text_fr": "République Islamique de Mauritanie\nMinistère de l'Éducation nationale\nEnseignement privé",
    "header_text_ar": "الجمهورية الإسلامية الموريتانية\nوزارة التهذيب الوطني\nالتعليم الخاص",
    "show_watermark": True, "show_frame": True,
    # No contact lines: an invented school must not print a number or address someone could own.
    "include_phone": False, "include_email": False, "include_website": False,
})
school.settings = settings
school.address = {**(school.address or {}), "street": "Tevragh-Zeina", "city": "Nouakchott"}
db.commit()

# 1. The receipt of Sidi's November payment, in French and in Arabic.
payment_id = sys.argv[4]
for lang in ("fr", "ar"):
    pdf = asyncio.run(PDFService(db, lang).generate_receipt_pdf(payment_id))
    (out / f"receipt-{lang}.pdf").write_bytes(pdf)
    print(out / f"receipt-{lang}.pdf")

# 2. Zahra's official first-trimester bulletin (bilingual), from its frozen publication,
#    with the demo identity and her renamed record.
issue = db.query(OfficialDocumentIssue).filter(OfficialDocumentIssue.id == sys.argv[5]).one()
service = OfficialDocumentService(db)
context = service._context(issue)
identity = core.DocumentIdentityResolver(db).resolve(issue.school_id).to_dict()
context["identity"] = identity
context["seal"] = ASSETS["demo://seal"]
student = dict(context.get("student") or {})
student.update({"name_fr": "Zahra Mint Mocktar", "name_ar": "زهرة بنت المختار", "code": "REVS0045", "class_name": "3e année collège A", "class_name_ar": "السنة الثالثة الإعدادية أ"})
print("student keys:", sorted(student))
context["student"] = student
result = DocumentRenderer().render_pdf_result("report_card.html", context, document_type="report_card")
(out / "bulletin.pdf").write_bytes(result.pdf_bytes)
print(out / "bulletin.pdf", "pages:", result.page_count)
print(json.dumps({k: context.get(k) for k in ("period_fr", "academic_year", "overall_average", "rank", "total_students")}, ensure_ascii=False))
