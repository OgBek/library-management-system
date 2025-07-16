import frappe
from frappe.model.document import Document
from frappe import throw, _

class Loan(Document):
    def validate(self):
        # Check if the book is already loaned out and not returned yet
        existing_loan = frappe.db.exists(
            "Loan",
            {
                "book": self.book,
                "return_date": [">=", self.loan_date],
                "name": ["!=", self.name]  # Exclude current doc if editing
            },
        )

        if existing_loan:
            throw(_("This book is already on loan. Please choose a different book or wait until it is returned."))


def get_permission_query_conditions(user):
    """
    Restrict members from seeing loans that do not belong to them.
    Admins or users without 'Member' role see all records.
    """
    if not user or "Member" not in frappe.get_roles(user):
        # No restriction for non-members (e.g., admins)
        return None

    member_id = frappe.db.get_value("Member", {"email": user}, "name")
    if member_id:
        return f"`tabLoan`.`member` = '{member_id}'"

    # Deny access if no member record matches user
    return "1 = 0"
