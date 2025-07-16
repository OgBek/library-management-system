import frappe
from frappe import _
from frappe.utils import nowdate
from frappe.exceptions import PermissionError


@frappe.whitelist(allow_guest=False)
def get_current_loans():
    """Return all loans that are currently active (not overdue)."""
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only librarians can view current loans."))

    return frappe.db.sql("""
        SELECT
            l.name AS loan_id,
            b.title AS book_title,
            m.fullname AS member_name,
            l.loan_date,
            l.return_date
        FROM `tabLoan` l
        LEFT JOIN `tabBook` b ON l.book = b.name
        LEFT JOIN `tabMember` m ON l.member = m.name
        WHERE l.return_date >= %s
        ORDER BY l.return_date ASC
    """, (nowdate(),), as_dict=True)


@frappe.whitelist(allow_guest=False)
def get_overdue_loans():
    """Return all loans that are overdue (return_date in the past)."""
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only librarians can view overdue loans."))

    return frappe.db.sql("""
        SELECT
            l.name AS loan_id,
            b.title AS book_title,
            m.fullname AS member_name,
            l.loan_date,
            l.return_date
        FROM `tabLoan` l
        LEFT JOIN `tabBook` b ON l.book = b.name
        LEFT JOIN `tabMember` m ON l.member = m.name
        WHERE l.return_date < %s
        ORDER BY l.return_date ASC
    """, (nowdate(),), as_dict=True)


@frappe.whitelist(allow_guest=False)
def export_member_loans_csv(member_id):
    """Export all loans for a given member as a CSV file."""
    if "Librarian" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only librarians can export loan history."))

    loans = frappe.db.sql("""
        SELECT
            l.name AS loan_id,
            b.title AS book_title,
            l.loan_date,
            l.return_date
        FROM `tabLoan` l
        LEFT JOIN `tabBook` b ON l.book = b.name
        WHERE l.member = %s
        ORDER BY l.loan_date DESC
    """, (member_id,), as_dict=True)

    if not loans:
        frappe.throw(_("No loans found for this member."))

    # Generate CSV string
    csv_data = "Loan ID,Book Title,Loan Date,Return Date\n"
    for loan in loans:
        csv_data += f"{loan.loan_id},{loan.book_title},{loan.loan_date},{loan.return_date}\n"

    frappe.response["filename"] = f"loan_history_{member_id}.csv"
    frappe.response["filecontent"] = csv_data
    frappe.response["type"] = "download"
    frappe.response["doctype"] = None


@frappe.whitelist(allow_guest=False)
def get_member_loans(email):
    """Return loan history for the member with the given email."""
    if "Member" not in frappe.get_roles(frappe.session.user):
        raise PermissionError(_("Only members can view their own loan history."))

    member_id = frappe.db.get_value("Member", {"email": email})
    if not member_id:
        frappe.throw(_("Member not found."))

    results = frappe.db.sql("""
        SELECT
            l.name AS loan_id,
            b.title AS book_title,
            l.loan_date,
            l.return_date
        FROM `tabLoan` l
        LEFT JOIN `tabBook` b ON l.book = b.name
        WHERE l.member = %s
        ORDER BY l.loan_date DESC
    """, (member_id,), as_dict=True)

    return results
