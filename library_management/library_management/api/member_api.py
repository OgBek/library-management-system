import frappe
import json
import re
from frappe import _
from frappe.exceptions import PermissionError, ValidationError

def check_librarian():
    if "Librarian" not in frappe.get_roles():
        frappe.throw(_("Only Librarians can perform this action."), PermissionError)

def validate_email(email):
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        frappe.throw(_("Invalid email address format."), ValidationError)

def validate_phone(phone):
    if not re.match(r"^\+?\d{7,15}$", phone):
        frappe.throw(_("Phone number must contain only digits and be 7 to 15 characters long."), ValidationError)

@frappe.whitelist()
def get_members():
    check_librarian()
    return frappe.get_all("Member", fields=["name", "fullname", "membership_id", "email", "phone"])

@frappe.whitelist()
def get_member(member_id):
    check_librarian()
    return frappe.get_doc("Member", member_id)

@frappe.whitelist()
def create_member(data):
    check_librarian()

    data = frappe._dict(json.loads(data))
    validate_email(data.email)
    validate_phone(data.phone)

    try:
        doc = frappe.get_doc({
            "doctype": "Member",
            "fullname": data.fullname,
            "membership_id": data.membership_id,
            "email": data.email,
            "phone": data.phone
        })
        doc.insert()
        return doc
    except Exception as e:
        frappe.throw(_("Failed to create member: ") + str(e), ValidationError)

@frappe.whitelist()
def update_member(member_id, data):
    check_librarian()

    data = frappe._dict(json.loads(data))
    validate_email(data.email)
    validate_phone(data.phone)

    try:
        doc = frappe.get_doc("Member", member_id)
        doc.update(data)
        doc.save()
        return doc
    except Exception as e:
        frappe.throw(_("Failed to update member: ") + str(e), ValidationError)

@frappe.whitelist()
def delete_member(member_id):
    check_librarian()

    try:
        frappe.delete_doc("Member", member_id)
        return {"status": "deleted"}
    except Exception as e:
        frappe.throw(_("Failed to delete member: ") + str(e), ValidationError)
