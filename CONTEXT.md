# HRRK Group website

Public group site for manufacturing, trade, brands, and exports. Visitor requests are Inquiries; Biziverse stores them as Leads.

## Language

**Inquiry**:
A visitor’s submitted request from a website form (who they are, what they want, which division).
_Avoid_: Enquiry (as a second concept), contact, ticket, RFQ-as-the-identity-of-the-person

**Home Inquiry**:
An Inquiry from the group contact form on the home page. First slice that creates a Lead; other forms are not Leads until we wire them.

**Lead**:
The Biziverse CRM person-record created from an Inquiry. One Lead per mobile number in the account.
_Avoid_: column, customer, deal, case

**Need**:
The free-text context on a Lead (`needs`) that tells an admin *what this Inquiry is about* (division, requirement, location as given).
_Avoid_: custom column, notes, improper details

**Source**:
A short tag on a Lead for *where the Inquiry came from* (which form or page).
_Avoid_: campaign, medium, UTM (unless we later store those inside Need)
