import frappe
import json
from frappe import _
from frappe.utils import nowdate
from frappe.exceptions import PermissionError


# ---------------- Librarian APIs ----------------

@frappe.whitelist()
def get_reservations():
    """Librarian can view all reservations with book titles and member fullnames."""
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only librarians can view all reservations."))

    return frappe.db.sql("""
        SELECT
            r.name,
            r.reservation_date,
            r.book,
            b.title AS book_title,
            r.member,
            m.fullname AS member_fullname
        FROM `tabReservation` r
        LEFT JOIN `tabBook` b ON r.book = b.name
        LEFT JOIN `tabMember` m ON r.member = m.name
        ORDER BY r.reservation_date DESC
    """, as_dict=True)


@frappe.whitelist()
def get_reservation(reservation_id):
    """Librarians can view any reservation. Members can view their own."""
    doc = frappe.get_doc("Reservation", reservation_id)

    if "Librarian" in frappe.get_roles(frappe.session.user):
        return doc

    member = frappe.get_value("Member", {"email": frappe.session.user})
    if doc.member != member:
        frappe.throw(_("You are not permitted to view this reservation."))
    return doc


@frappe.whitelist()
def create_reservation(data):
    """Librarians create reservations with full data input."""
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only librarians can create a reservation."))

    if isinstance(data, str):
        data = frappe._dict(json.loads(data))
    else:
        data = frappe._dict(data)

    # Reject if book is available
    is_on_loan = frappe.db.exists("Loan", {
        "book": data.book,
        "return_date": [">=", nowdate()]
    })
    if not is_on_loan:
        frappe.throw(_("This book is currently available. No need to reserve."))

    # Check for duplicate reservation today
    if frappe.db.exists("Reservation", {
        "book": data.book,
        "member": data.member,
        "reservation_date": nowdate()
    }):
        frappe.throw(_("This member has already reserved this book today."))

    # Check if already loaned today
    if frappe.db.exists("Loan", {
        "book": data.book,
        "member": data.member,
        "loan_date": nowdate(),
        "return_date": [">=", nowdate()]
    }):
        frappe.throw(_("You cannot reserve a book you already borrowed today."))

    doc = frappe.get_doc({
        "doctype": "Reservation",
        "book": data.book,
        "member": data.member,
        "reservation_date": nowdate()
    })
    doc.insert()
    return doc


@frappe.whitelist()
def update_reservation(reservation_id, data):
    """Librarians can update reservations."""
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only librarians can update reservations."))

    if isinstance(data, str):
        data = frappe._dict(json.loads(data))
    else:
        data = frappe._dict(data)

    doc = frappe.get_doc("Reservation", reservation_id)
    doc.update(data)
    doc.save()
    return doc


@frappe.whitelist()
def delete_reservation(reservation_id):
    """Librarians can delete reservations."""
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only librarians can delete reservations."))

    frappe.delete_doc("Reservation", reservation_id)
    return {"status": "deleted"}


# ---------------- Member APIs ----------------

@frappe.whitelist()
def get_my_reservations():
    """Members can view their own reservations."""
    member = frappe.get_value("Member", {"email": frappe.session.user})
    if not member:
        frappe.throw(_("No member record linked to this user."))

    return frappe.db.sql("""
        SELECT
            r.name,
            r.book,
            r.reservation_date,
            b.title AS book_title
        FROM `tabReservation` r
        LEFT JOIN `tabBook` b ON r.book = b.name
        WHERE r.member = %s
        ORDER BY r.reservation_date DESC
    """, (member,), as_dict=True)


@frappe.whitelist()
def create_my_reservation(book_name):
    """Members create a reservation only if book is currently on loan."""
    member = frappe.get_value("Member", {"email": frappe.session.user})
    if not member:
        frappe.throw(_("No member record linked to this user."))

    if not frappe.db.exists("Loan", {
        "book": book_name,
        "return_date": [">=", nowdate()]
    }):
        frappe.throw(_("This book is currently available. No need to reserve."))

    if frappe.db.exists("Reservation", {
        "book": book_name,
        "member": member,
        "reservation_date": nowdate()
    }):
        frappe.throw(_("You have already reserved this book today."))

    if frappe.db.exists("Loan", {
        "book": book_name,
        "member": member,
        "loan_date": nowdate(),
        "return_date": [">=", nowdate()]
    }):
        frappe.throw(_("You cannot reserve a book you already borrowed today."))

    doc = frappe.get_doc({
        "doctype": "Reservation",
        "book": book_name,
        "member": member,
        "reservation_date": nowdate()
    })
    doc.insert()
    return doc


@frappe.whitelist()
def cancel_my_reservation(reservation_id):
    """Members can cancel their own reservations."""
    member = frappe.get_value("Member", {"email": frappe.session.user})
    if not member:
        frappe.throw(_("No member record linked to this user."))

    reservation = frappe.get_doc("Reservation", reservation_id)
    if reservation.member != member:
        frappe.throw(_("You are not allowed to cancel this reservation."))

    reservation.delete()
    return {"status": "Reservation cancelled"}
