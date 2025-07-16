# file: library_management/api/loan.py

import frappe
import json
from frappe import _
from frappe.utils import nowdate
from frappe.exceptions import PermissionError

@frappe.whitelist()
def get_loans():
    return frappe.get_all("Loan", fields=["name", "book", "member", "loan_date", "return_date"])

@frappe.whitelist()
def get_loan(loan_id):
    return frappe.get_doc("Loan", loan_id)

@frappe.whitelist()
def create_loan():
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only Librarians can create a loan."))

    data = frappe.form_dict.get("data")
    if not data:
        frappe.throw(_("Missing data payload."))

    data = frappe._dict(json.loads(data))

    required_fields = ["book", "member", "loan_date", "return_date"]
    for field in required_fields:
        if not data.get(field):
            frappe.throw(_(f"{field.replace('_', ' ').title()} is required."))

    # Check if book is already on loan
    existing_doc = frappe.get_all(
        "Loan",
        filters={
            "book": data.book,
            "return_date": [">=", nowdate()]
        },
        fields=["name", "member"]
    )
    if existing_doc:
        member = existing_doc[0].member
        try:
            member_name = frappe.get_doc("Member", member).fullname
        except:
            member_name = member
        frappe.throw(_(f"You cannot loan this book because it is already loaned out to '{member_name}' and has not been returned yet."))

    doc = frappe.get_doc({
        "doctype": "Loan",
        "book": data.book,
        "member": data.member,
        "loan_date": data.loan_date,
        "return_date": data.return_date
    })
    doc.insert()
    return doc

@frappe.whitelist()
def update_loan():
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only Librarians can update a loan."))

    loan_id = frappe.form_dict.get("loan_id")
    data = frappe.form_dict.get("data")

    if not loan_id or not data:
        frappe.throw(_("Missing loan ID or data."))

    data = frappe._dict(json.loads(data))
    current_doc = frappe.get_doc("Loan", loan_id)

    # Check if trying to update to a book that's already on loan (excluding the current loan)
    if data.book:
        existing_doc = frappe.get_all(
            "Loan",
            filters={
                "book": data.book,
                "return_date": [">=", nowdate()],
                "name": ["!=", loan_id]
            },
            fields=["name", "member"]
        )
        if existing_doc:
            member = existing_doc[0].member
            try:
                member_name = frappe.get_doc("Member", member).fullname
            except:
                member_name = member
            frappe.throw(_(f"You cannot reassign this book because it is currently loaned out to '{member_name}' and not yet returned."))

    current_doc.update(data)
    current_doc.save()
    return current_doc

@frappe.whitelist()
def delete_loan():
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only Librarians can delete a loan."))

    loan_id = frappe.form_dict.get("loan_id")
    if not loan_id:
        frappe.throw(_("Missing loan ID."))

    frappe.delete_doc("Loan", loan_id)
    return {"status": "deleted"}

@frappe.whitelist()
def get_books_on_loan():
    return frappe.get_all(
        "Loan",
        filters={"return_date": [">=", nowdate()]},
        fields=["name", "book", "member", "loan_date", "return_date"],
        order_by="loan_date desc"
    )

@frappe.whitelist()
def get_overdue_books():
    return frappe.get_all(
        "Loan",
        filters={"return_date": ["<", nowdate()]},
        fields=["name", "book", "member", "loan_date", "return_date"],
        order_by="return_date asc"
    )
