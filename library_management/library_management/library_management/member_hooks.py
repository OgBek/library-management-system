# file: library_management/library_management/member_hooks.py

import frappe
from frappe.core.doctype.user.user import generate_keys

def create_user_for_member(doc, method):
    # ✅ Skip user creation if explicitly flagged (during manual registration API)
    if getattr(frappe.local, "skip_member_user_creation", False):
        return

    # Avoid duplicate user creation
    if frappe.db.exists("User", doc.email):
        return

    # Create new system user for the Member
    user = frappe.get_doc({
        "doctype": "User",
        "email": doc.email,
        "first_name": doc.fullname,
        "send_welcome_email": 1,
        "roles": [{"role": "Member"}],
        "new_password": "zz123koob123"  # Default password if created via hook
    })

    user.insert(ignore_permissions=True)

    # ✅ Only generate API keys if current user is System Manager
    if "System Manager" in frappe.get_roles():
        generate_keys(user.name)
