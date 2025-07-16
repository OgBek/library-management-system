import frappe
import json
from frappe import _
from frappe.exceptions import PermissionError

@frappe.whitelist(allow_guest=True)
def get_books():
    return frappe.get_all("Book", fields=["name", "title", "author", "publish_date", "isbn"])

@frappe.whitelist()
def get_book(book_id):
    return frappe.get_doc("Book", book_id)

@frappe.whitelist()
def create_book(data):
    frappe.logger().info(f"📥 Incoming book data: {data}")
    roles = frappe.get_roles()
    frappe.logger().info(f"👤 User roles: {roles}")
    
    if "Librarian" not in roles:
        raise PermissionError(_("Only Librarians can create books."))

    data = frappe._dict(json.loads(data))

    doc = frappe.get_doc({
        "doctype": "Book",
        "title": data.title,
        "author": data.author,
        "isbn": data.isbn,
        "publish_date": data.publish_date
    })
    doc.insert()
    return doc

@frappe.whitelist()
def update_book(book_id, data):
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only Librarians can update books."))

    data = frappe._dict(json.loads(data))
    doc = frappe.get_doc("Book", book_id)
    doc.update(data)
    doc.save()
    return doc

@frappe.whitelist()
def delete_book(book_id):
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only Librarians can delete books."))

    frappe.delete_doc("Book", book_id)
    return {"status": "deleted"}
