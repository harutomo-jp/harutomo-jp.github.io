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

Every client/server connection begins with authentication to verify to the party on each end of the connection that the identity of both ends is genuine.  The client and the KDC do not implicitly trust each others' identities.  So to prove to one another that they are who they say they are, the client initiates an authentication server request (AS-REQ).  The AS-REQ message contains information about the client such as it's principal name, requested service (in this case, the TGS), and a timestamp encrypted with a key derived from the client's password.  When the AS receives the AS-REQ, it searches the Kerberos database for the Client's Principal Name and tries to decrypt the timestamp using the associated password hash in the database.  If the decryption is successful and the timestamp is acceptable, the AS detemines that the request is legitimate and the client can be trusted and responds to the client with an authentication server response (AS-REP) message.  This message contains a session key for the client that is encrypted using a key derived from the client's password hash, and an encrypted burb of data called the Ticket Granting Ticket (TGT).  The session key will be used when the client communicates with the TGS and will prove that the client is the owner of the TGT.  The TGT contains

<p align="center">
  <img src="/assets/images/Kerberoasting/ASREQandASREP.png">
</p>


Sources:
https://redsiege.com/tools-techniques/2020/10/detecting-kerberoasting/
https://www.hackthebox.com/blog/what-is-kerberos-authentication
https://iam.uconn.edu/the-kerberos-protocol-explained/
https://web.mit.edu/kerberos/krb5-1.12/doc/admin/database.html
https://syfuhs.net/a-bit-about-kerberos
https://app.diagrams.net/

