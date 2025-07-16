import frappe
from frappe.utils import nowdate
from frappe import _

def send_overdue_notifications():
    print("📬 Running send_overdue_notifications()...")

    overdue_loans = frappe.get_all(
        "Loan",
        filters={
            "return_date": ("<", nowdate()),
            "notified_overdue": ("!=", 1),
            "docstatus": 1
        },
        fields=["name", "member", "book", "loan_date", "return_date"]
    )

    print(f"📚 Found {len(overdue_loans)} overdue loans")

    for loan in overdue_loans:
        try:
            print(f"🔍 Processing loan {loan.name}")

            member_email = frappe.db.get_value("Member", loan.member, "email")
            book_title = frappe.db.get_value("Book", loan.book, "title")

            print(f"👤 Member email: {member_email}")
            print(f"📖 Book title: {book_title}")

            if member_email:
                frappe.sendmail(
                    recipients=[member_email],
                    subject=_("Library Book Overdue"),
                    message=f"""
                        <p>Dear Member,</p>
                        <p>This is a reminder that your loan for the book <strong>{book_title}</strong>
                        was due on <strong>{loan.return_date}</strong>.</p>
                        <p>Please return it as soon as possible to avoid penalties.</p>
                        <br>
                        <p>Thank you,</p>
                        <p>Your Library</p>
                    """,
                )
                print(f"✅ Sent notification for Loan: {loan.name} to {member_email}")

                # Mark loan as notified
                loan_doc = frappe.get_doc("Loan", loan.name)
                loan_doc.notified_overdue = 1
                loan_doc.save(ignore_permissions=True)

                print(f"📝 Updated notified_overdue for {loan.name}")

            else:
                print(f"⚠️ No email found for member {loan.member}")

        except Exception as e:
            frappe.log_error(f"Failed to send overdue notification for loan {loan.name}: {str(e)}")
            print(f"❌ Error sending for {loan.name}: {str(e)}")
