# file: library_management/tests/test_library.py

import frappe
import unittest
from unittest.mock import patch
from frappe.exceptions import ValidationError, PermissionError

class TestLibrarySystem(unittest.TestCase):
    def setUp(self):
        frappe.set_user("Administrator")

        self.book = frappe.get_doc({
            "doctype": "Book",
            "title": "Test Book",
            "author": "Test Author",
            "isbn": "1234567890",
            "publish_date": "2022-01-01"
        }).insert(ignore_permissions=True)

        self.member = frappe.get_doc({
            "doctype": "Member",
            "fullname": "Test Member",
            "membership_id": "TM001",
            "email": "test@example.com",
            "phone": "123456789"
        }).insert(ignore_permissions=True)

    def tearDown(self):
        frappe.db.rollback()

    def test_create_loan_success(self):
        loan = frappe.get_doc({
            "doctype": "Loan",
            "book": self.book.name,
            "member": self.member.name,
            "loan_date": "2025-07-14",
            "return_date": "2025-07-20"
        }).insert(ignore_permissions=True)
        self.assertTrue(frappe.db.exists("Loan", loan.name))

    def test_cannot_loan_same_book_twice(self):
        frappe.get_doc({
            "doctype": "Loan",
            "book": self.book.name,
            "member": self.member.name,
            "loan_date": "2025-07-14",
            "return_date": "2025-07-20"
        }).insert(ignore_permissions=True)

        with self.assertRaises(ValidationError):
            frappe.get_doc({
                "doctype": "Loan",
                "book": self.book.name,
                "member": self.member.name,
                "loan_date": "2025-07-15",
                "return_date": "2025-07-21"
            }).insert(ignore_permissions=True)

    def test_only_librarian_can_create_loan(self):
        frappe.set_user("Guest")
        with self.assertRaises(PermissionError):
            frappe.get_doc({
                "doctype": "Loan",
                "book": self.book.name,
                "member": self.member.name,
                "loan_date": "2025-07-14",
                "return_date": "2025-07-20"
            }).insert()

    def test_update_book(self):
        self.book.title = "Updated Title"
        self.book.save()
        updated = frappe.get_doc("Book", self.book.name)
        self.assertEqual(updated.title, "Updated Title")

    def test_delete_member(self):
        name = self.member.name
        frappe.delete_doc("Member", name)
        self.assertFalse(frappe.db.exists("Member", name))

    def test_required_fields_validation(self):
        with self.assertRaises(ValidationError):
            frappe.get_doc({
                "doctype": "Book",
                "author": "Missing Title"
            }).insert()

    def test_create_reservation(self):
        # Make book unavailable by loaning it to the same member
        frappe.get_doc({
            "doctype": "Loan",
            "book": self.book.name,
            "member": self.member.name,
            "loan_date": "2025-07-01",
            "return_date": "2025-07-10"
        }).insert(ignore_permissions=True)

        reservation = frappe.get_doc({
            "doctype": "Reservation",
            "book": self.book.name,
            "member": self.member.name,
            "reservation_date": "2025-07-15"
        }).insert(ignore_permissions=True)

        self.assertTrue(frappe.db.exists("Reservation", reservation.name))

    def test_update_reservation(self):
        # Make book unavailable
        frappe.get_doc({
            "doctype": "Loan",
            "book": self.book.name,
            "member": self.member.name,
            "loan_date": "2025-07-01",
            "return_date": "2025-07-10"
        }).insert(ignore_permissions=True)

        reservation = frappe.get_doc({
            "doctype": "Reservation",
            "book": self.book.name,
            "member": self.member.name,
            "reservation_date": "2025-07-15"
        }).insert(ignore_permissions=True)

        reservation.reservation_date = "2025-07-20"
        reservation.save()
        updated = frappe.get_doc("Reservation", reservation.name)
        self.assertEqual(updated.reservation_date, "2025-07-20")

    def test_delete_reservation(self):
        # Make book unavailable
        frappe.get_doc({
            "doctype": "Loan",
            "book": self.book.name,
            "member": self.member.name,
            "loan_date": "2025-07-01",
            "return_date": "2025-07-10"
        }).insert(ignore_permissions=True)

        reservation = frappe.get_doc({
            "doctype": "Reservation",
            "book": self.book.name,
            "member": self.member.name,
            "reservation_date": "2025-07-15"
        }).insert(ignore_permissions=True)

        name = reservation.name
        frappe.delete_doc("Reservation", name)
        self.assertFalse(frappe.db.exists("Reservation", name))

    @patch("frappe.sendmail")
    def test_overdue_notification_mock(self, mock_sendmail):
        # Overdue loan
        loan = frappe.get_doc({
            "doctype": "Loan",
            "book": self.book.name,
            "member": self.member.name,
            "loan_date": "2025-06-01",
            "return_date": "2025-06-05"
        }).insert(ignore_permissions=True)

        from library_management.overdue_notification import send_overdue_notification
        send_overdue_notification()

        self.assertTrue(mock_sendmail.called)
        args, kwargs = mock_sendmail.call_args
        self.assertIn("test@example.com", kwargs["recipients"])
