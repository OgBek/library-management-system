from frappe import override_whitelisted_method

app_name = "library_management"
app_title = "Library Management"
app_publisher = "bekam beyene"
app_description = "Custom Library System"
app_email = "bbekam60@gmail.com"
app_license = "mit"

# Scheduled Tasks: Daily overdue notification emails
scheduler_events = {
    "daily": [
        "library_management.overdue_notification.send_overdue_notifications"
    ]
}

# Override Whitelisted API Methods
override_whitelisted_methods = {
    # Book APIs
    "library_management.api.book.get_books": "library_management.api.book_api.get_books",
    "library_management.api.book.get_book": "library_management.api.book_api.get_book",
    "library_management.api.book.create_book": "library_management.api.book_api.create_book",
    "library_management.api.book.update_book": "library_management.api.book_api.update_book",
    "library_management.api.book.delete_book": "library_management.api.book_api.delete_book",

    # Member APIs
    "library_management.api.member.get_members": "library_management.api.member_api.get_members",
    "library_management.api.member.get_member": "library_management.api.member_api.get_member",
    "library_management.api.member.create_member": "library_management.api.member_api.create_member",
    "library_management.api.member.update_member": "library_management.api.member_api.update_member",
    "library_management.api.member.delete_member": "library_management.api.member_api.delete_member",

    # Loan APIs
    "library_management.api.loan.get_loans": "library_management.api.loan_api.get_loans",
    "library_management.api.loan.get_loan": "library_management.api.loan_api.get_loan",
    "library_management.api.loan.create_loan": "library_management.api.loan_api.create_loan",
    "library_management.api.loan.update_loan": "library_management.api.loan_api.update_loan",
    "library_management.api.loan.delete_loan": "library_management.api.loan_api.delete_loan",
    "library_management.api.loan.get_books_on_loan": "library_management.api.loan_api.get_books_on_loan",
    "library_management.api.loan.get_overdue_books": "library_management.api.loan_api.get_overdue_books",

    # Reservation APIs
    "library_management.api.reservation.get_reservations": "library_management.api.reservation_api.get_reservations",
    "library_management.api.reservation.get_reservation": "library_management.api.reservation_api.get_reservation",
    "library_management.api.reservation.create_reservation": "library_management.api.reservation_api.create_reservation",
    "library_management.api.reservation.update_reservation": "library_management.api.reservation_api.update_reservation",
    "library_management.api.reservation.delete_reservation": "library_management.api.reservation_api.delete_reservation",

    # Auth APIs 
    "library_management.api.auth.login": "library_management.api.auth_api.login",
    "library_management.api.auth.logout": "library_management.api.auth_api.logout",
    "library_management.api.auth.get_user_info": "library_management.api.auth_api.get_user_info",
    #register
     "library_management.api.register_api.register_member": "library_management.api.register_api.register_member",



    # Report APIs (NEW)
    "library_management.api.report.get_current_loans": "library_management.api.report_api.get_current_loans",
    "library_management.api.report.get_overdue_loans": "library_management.api.report_api.get_overdue_loans",
}

permission_query_conditions = {
    "Loan": "library_management.library_management.doctype.loan.loan.get_permission_query_conditions",
    "Reservation": "library_management.library_management.doctype.reservation.reservation.get_permission_query_conditions",
}

doc_events = {
    "Member": {
        "after_insert": "library_management.library_management.member_hooks.create_user_for_member"
    }
}
