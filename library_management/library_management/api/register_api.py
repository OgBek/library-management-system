# file: library_management/api/register_api.py

import frappe
from frappe import _
from frappe.utils.password import update_password

@frappe.whitelist(allow_guest=True)
def register_member(fullname, membership_id, email, phone, password):
    if frappe.db.exists("User", email):
        frappe.throw(_("User already exists with this email"))

    if frappe.db.exists("Member", {"membership_id": membership_id}):
        frappe.throw(_("Membership ID already exists"))

    # ✅ Prevent hook from also trying to create the user
    frappe.local.skip_member_user_creation = True

    # Create Member record (no password field!)
    member = frappe.get_doc({
        "doctype": "Member",
        "fullname": fullname,
        "membership_id": membership_id,
        "email": email,
        "phone": phone
    })
    member.insert(ignore_permissions=True)

    # Manually create User account
    user = frappe.get_doc({
        "doctype": "User",
        "email": email,
        "first_name": fullname,
        "enabled": 1,
        "new_password": password,
        "roles": [{"role": "Member"}],
    })
    user.insert(ignore_permissions=True)

    update_password(user.name, password)

    return {
        "message": _("Member and user created successfully"),
        "user": user.name,
        "member": member.name
    }
