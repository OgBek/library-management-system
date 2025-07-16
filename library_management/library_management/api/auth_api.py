import frappe
from frappe import _
from frappe.auth import LoginManager

@frappe.whitelist(allow_guest=True)
def login(email, password):
    """Authenticate user and start session."""
    try:
        frappe.local.login_manager = LoginManager()
        frappe.local.login_manager.authenticate(email, password)
        frappe.local.login_manager.post_login()

        user_doc = frappe.get_doc("User", email)
        roles = [role.role for role in user_doc.roles]

        return {
            "message": _("Login successful"),
            "email": email,
            "full_name": user_doc.full_name,
            "roles": roles,
            "sid": frappe.session.sid
        }
    except frappe.AuthenticationError:
        frappe.clear_messages()
        frappe.local.response.http_status_code = 401
        return {
            "message": _("Invalid login credentials"),
            "exception": "AuthenticationError",
            "status": "failed"
        }

@frappe.whitelist(allow_guest=True)
def logout():
    """Logout current user and clear session."""
    if hasattr(frappe.local, "login_manager"):
        frappe.local.login_manager.logout()
    frappe.local.response["message"] = _("Logged out successfully")
    return {"status": "success"}

@frappe.whitelist(allow_guest=False)
def get_user_info():
    """Return the logged-in user's email, full name, and roles."""
    user_email = frappe.session.user
    user_doc = frappe.get_doc("User", user_email)
    roles = [role.role for role in user_doc.roles]

    return {
        "email": user_email,
        "full_name": user_doc.full_name,
        "roles": roles
    }
