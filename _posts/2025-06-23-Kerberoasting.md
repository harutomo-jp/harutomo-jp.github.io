---
layout: single
title: Understanding Kerberoasting from Start to Finish
excerpt: Kerberoasting - an attack technique first discovered almost a decade ago and yet still remains prevalent as a valid technique for password cracking and pass the hash attacks, enabling privilege escalation and lateral movement within an Active Directory environment.  Due to the popularity of the attack, there have been countless tools already created to scan for and abuse Kerberoasting easily.  Having seen and used this attack before many times, I wanted to take the time to go in-depth and explain how it works!
date: 25-06-2025
classes: wide
header:
  teaser: /assets/images/kali-logo.png
  teaser_home_page: false
  icon: /assets/images/code.png
categories:
tags:
---

## Background

Kerberoasting - an attack technique first discovered almost a decade ago and yet still remains prevalent as a valid technique for password cracking and pass the hash attacks, enabling privilege escalation and lateral movement within an Active Directory environment.  Due to the popularity of the attack, there have been countless tools already created to scan for and abuse Kerberoasting easily.  Having seen and used this attack before many times, I wanted to take the time to go in-depth and explain how it works!

Seeing as kerberoasting is an attack on Microsoft Active Directory's 'Kerberos' authentication protocol, we first must understand how Kerberos authnetication works.

## Kerberos - The Three-Headed Guardian

Kerberos is a ticket-based authentiction protocol designed by MIT.  Fundamentally, Kerberos was designed to provide a secure authentication between clients and services across an insecure network based on the [Needham-Schroeder protocol](https://en.wikipedia.org/wiki/Needham%E2%80%93Schroeder_protocol) and has been adopted by Microsoft as the default authentication method for their Active Directory service.  Kerberos allows for trust to be established between a client and a service based on a trusted third-party entity and the name "Kerberos", the three-headed dog of Greek mythology, references those three components.  In Microsoft Active Directory, these three components are the following:

1. **Client:**  The client is the user/device/identity that is trying to authenticate.  MIT describes it as "the identity you use to log on to Kerberos".  For example, this could be a User Principal (user@domain.com) or a Service Principal (HTTP/hostname.domain.com@domain.com).

2. **Member Server:** This is the server on the domain with the asset/service that the client is attempting to access.  For example, the resource could be a SMB share (\\wk01.domain.com\SharedFolder).  In essense, clients initiate actions, servers respond.

3. **Key Distribution Center:** The Key Distribution Center (KDC) is the trusted third-party in the domain.  The KDC is always a Domain Controller in Active Directory and is the ultimate authority of managing authentication, distributing tickets, and determining the identity of clients and resources.

### KDC -The Ultimate Authority

To perform its role as the trusted third-party, the KDC has the following components:

1. **Kerberos database:** This is the database that contains all of a domain's user/service administrative information, including password hashes.  This database will be used as a reference point for the KDC to validate the identity of whatever principal it is communicating with.

2. **Kerberos Authentication Service (AS):** This service is used by principals communicating with the KDC to authenticate themselves and receive a Ticket Granting Ticket (TGT).

2. **Ticket Granting Service (TGS):**  This service is used by principals to use their TGT to request a Service Ticket (ST) for accessing a specific resource.

<p align="center">
  <img src="/assets/images/Kerberoasting/Kerberos-Setup.png">
</p>

### The Initial Authentication (AS-REQ & AS-REP)

Every client/server connection begins with authentication to the KDC to verify to the party on each end of the connection that the identity of both ends is genuine.  To eastablish trust between client and KDC, the client initiates an authentication server request (AS-REQ).  The AS-REQ message contains information about the client such as the client's principal name, the service being requested (TGS), and a timestamp encrypted with a key that is derived from the client's password.

When the AS receives the AS-REQ message, it searches the Kerberos database for the client's principal name and attempts to decrypt the timestamp using the client's associated password hash in the database.  If the decryption is successful and the timestamp is within an acceptable timeframe, the AS determines that the request is legitimate and that the client knows their password and can be trusted.

Now that the AS trusts the client, it responds back with an authentication server response (AS-REP) message.  The main part of the AS-REP message is a blob of data, including a string known as a session key, that the KDC encrypts using the special **krbtgt** account's password that is referred to as the "Ticket Granting Ticket".  The other part of the AS-REP message is metadata encrypted using the client's key that contains useful information about the contents of the ticket and includes the same session key that is in the ticket's data.

<p align="center">
  <img src="/assets/images/Kerberoasting/ASREQandASREP.png">
</p>

The session key is now a shared secret that establishes trust between the client, the KDC, and the member server.  The KDC can trust the client because the client provided their password that matched the kerberos database, the client can trust the KDC because the KDC was able to encrypt data using the client's password as the KDC is the only entity that should have the key.  The member server trusts the KDC because the ticket was encrypted using the member server's password, which only the KDC could issue.  Lastly, the member server can trust the client because the client is using the same secret key issued by the KDC.

<p align="center">
  <img src="/assets/images/Kerberoasting/ASREQandASREPfinal.png">
</p>

### RED ALERT! - Something's roasting.. AS-REP Roasting!

Kerberos can be configured so that pre-authentication is disabled, which means that when the KDC received an AS-REQ message, it doesn't require an encrypted timestamp to check whether the AS-REQ message was made by a client that knew its own password.  Instead, the KDC receives the AS-REQ and immediately returns an AS-REP with a TGT and a blob of data encrypted with a key derived from the client's password.

This can be abused by attackers, who can make malicious AS-REQ requests using the UPNs of other users and machine accounts in the domain.  The KDC doesn't verify the requests and gives the attacker a blob of data that can be brute-forced in offline cracking attacks to discover user passwords.  This attack is known as AS-REP Roasting!

<p align="center">
  <img src="/assets/images/Kerberoasting/asreproasting.png">
</p>

### A Ticket to Ride - The TGS-REQ and TGS-REP

Now that the client has authenticated itself to the KDC, the client needs to use its TGT to request access to the member server it wants to interact with.  This request is called a Ticket Granting Service Request (TGS-REQ).  The TGS-REQ is, in many ways, identical to the AS-REQ.  The only differences being that the messages includes the client's TGT received from the AS-REP which is labeled in the TGS-REQ as "pre-auth data" and the TGS-REQ includes the names of the requested service.  The TGS-REQ is handled by the Ticket Granting Service (TGS) rather than the Authentication Service (AS).

When the TGS received the message, it first verifies the pre-auth data (the TGT).  The TGT is encrypted using the **krbtgt** account password, which only the KDC knows.  Once the KDC is able to decrypt the TGT, it verifies the included session key which only the Client the TGT was issued to should know.  If the session key matches, then the TGS has verified that the KDC issued the ticket to the client and that the TGT came from the client and so the TGS generates a Ticket Granting Service Response (TGS-REP) message.

The TGS-REP is comprised of two parts: the **Ticket Granting Service Ticket or Service Ticket** and the **enc-part**.  For the Service Ticket, the TGS finds the service/account requested in the TGS-REQ in the Kerberos Database and uses the account's associated password to generate a key used to encrypt the Service Ticket.  This way, the ticket can only be used for the requested service.  The Service Ticket includes the Client's UPN, the name of the target service, a new session key used for encryption between the client and the service, and additional useful metadata.

The enc-part is encrypted using the client's session key from the AS-REP and contains the new session key that was included in the Service Ticket that will be used for encrypted communication with the requested service, and additional useful metadata such as ticket validity details and timestamps.

<p align="center">
  <img src="/assets/images/Kerberoasting/TGSREQandTGSREP.png">
</p>

### Final Steps - Communicating with the Application

The Client now has a Service Ticket with the session key it needs to communicate securely with the target service.  To commmunicate with the application, the client takes the encrypted Service Ticket and converts it into an **Application Request (AP-REQ)** message.  The AP-REQ, like most of our REQ messages so far, is comprised of two main parts: the Service Ticket, and an authenticator encrypted using the session key the client received from the TGS-REP.

The service will receive the AP-REQ and decrypt the Service Ticket using its own password, and verify the session ID.  If the decryption is successful, the service will respond with an AP-REP message that confirms that the service was able to decrypt the Service Ticket issued by the KDC and that secure communication is established.

<p align="center">
  <img src="/assets/images/Kerberoasting/APREQandAPREP.png">
</p>









Sources:
https://redsiege.com/tools-techniques/2020/10/detecting-kerberoasting/
https://www.hackthebox.com/blog/what-is-kerberos-authentication
https://iam.uconn.edu/the-kerberos-protocol-explained/
https://web.mit.edu/kerberos/krb5-1.12/doc/admin/database.html
https://syfuhs.net/a-bit-about-kerberos
https://app.diagrams.net/

