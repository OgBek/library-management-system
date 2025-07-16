import frappe
from frappe.model.document import Document
from frappe import throw, _

class Reservation(Document):
    def validate(self):
        # 1. Prevent duplicate reservation on the same day by the same member for the same book
        duplicate = frappe.db.exists(
            "Reservation",
            {
                "member": self.member,
                "book": self.book,
                "reservation_date": self.reservation_date,
                "name": ["!=", self.name]
            }
        )
        if duplicate:
            throw(_("You have already reserved this book on this date."))

        # 2. Prevent reservation if book is currently available (not on loan)
        is_on_loan = frappe.db.exists(
            "Loan",
            {
                "book": self.book,
                "return_date": [">=", self.reservation_date]
            }
        )
        if not is_on_loan:
            throw(_("This book is available. You do not need to reserve it."))

        # 3. Prevent a member from reserving a book they already borrowed and haven't returned yet
        overlapping_loan = frappe.db.exists(
            "Loan",
            {
                "member": self.member,
                "book": self.book,
                "loan_date": ["<=", self.reservation_date],
                "return_date": [">=", self.reservation_date]
            }
        )
        if overlapping_loan:
            throw(_("You have already borrowed this book and cannot reserve it during the loan period."))

def get_permission_query_conditions(user):
    """
    Row-level permission: Members only see their own reservations.
    Admins or other roles can see all.
    """
    if not user or "Member" not in frappe.get_roles(user):
        return None

    member_id = frappe.db.get_value("Member", {"email": user}, "name")
    if member_id:
        return f"`tabReservation`.`member` = '{member_id}'"
    return "1=0"
