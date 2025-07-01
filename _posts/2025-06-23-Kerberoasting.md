---
layout: single
title: Understanding Kerberoasting from Start to Finish
excerpt: Kerberoasting - an attack technique first discovered almost a decade ago and yet still remains prevalent as a valid technique for password cracking and pass the hash attacks, enabling privilege escalation and lateral movement within an Active Directory environment.  Due to the popularity of the attack, there have been countless tools already created to scan for and abuse Kerberoasting easily.  Having used this attack before many times in CTFs and while studying for my OSCP I believed that I understood how it worked, but recently I was asked to explain it fully and I found myself grasping at terms making me realize I didn't quite know this technique as well as I thought!"
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

Every client/server connection begins with authentication to verify to the party on each end of the connection that the identity of both ends is genuine.  The client and the KDC do not implicitly trust each others' identities.  So, to eastablish trust between client and KDC, the client initiates an authentication server request (AS-REQ).  The AS-REQ message contains information about the client such as the client's principal name, the service being requested, and a timestamp encrypted with a key that is derived from the client's password.

When the AS receives the AS-REQ message, it searches the Kerberos database for the client's principal name and attempts to decrypt the timestamp using the client's associated password hash in the database.  If the decryption is successful and the timestamp is within an acceptable timeframe, the AS determines that the request is legitimate and that the client knows their password and can be trusted.

Now that the AS trusts the client, it responds back with an authentication server response (AS-REP) message.  The main part of the AS-REP message is a blob of data, including a string known as a session key, that the KDC encrypts using the target member server's password that is referred to as the "ticket".  The other part of the AS-REP message is metadata encrypted using the client's key that contains useful information about the contents of the ticket and includes the same session key that is in the ticket's data.

<p align="center">
  <img src="/assets/images/Kerberoasting/ASREQandASREP.png">
</p>

The session key is now a shared secret that establishes trust between the client, the KDC, and the member server.  The KDC can trust the client because the client provided their password that matched the kerberos database, the client can trust the KDC because the KDC was able to encrypt data using the client's password as the KDC is the only entity that should have the key.  The member server trusts the KDC because the ticket was encrypted using the member server's password, which only the KDC could issue.  Lastly, the member server can trust the client because the client is using the same secret key issued by the KDC.

<p align="center">
  <img src="/assets/images/Kerberoasting/ASREQandASREPfinal.png">
</p>

### RED ALERT! - Something's roasting.. AS-REP Roasting!

In this form, the client has the ability to ask the KDC to return an AS-REP message for domain objects that has a blob of data encrypted with a key derived from the object's password.  This screams DANGER!  If



Sources:
https://redsiege.com/tools-techniques/2020/10/detecting-kerberoasting/
https://www.hackthebox.com/blog/what-is-kerberos-authentication
https://iam.uconn.edu/the-kerberos-protocol-explained/
https://web.mit.edu/kerberos/krb5-1.12/doc/admin/database.html
https://syfuhs.net/a-bit-about-kerberos
https://app.diagrams.net/

