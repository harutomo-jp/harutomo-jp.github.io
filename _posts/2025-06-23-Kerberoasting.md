---
layout: single
title: Kerberoasting - Dissecting the Persistent Attack
excerpt: Kerberoasting - an attack technique first discovered almost a decade ago and yet still remains prevalent as a valid technique for password cracking and pass the hash attacks, enabling privilege escalation and lateral movement within an Active Directory environment.  Due to the popularity of the attack, there have been countless tools already created to scan for and abuse Kerberoasting easily.  Having used this attack before many times in CTFs and while studying for my OSCP I believed that I understood how it worked, but recently I was asked to explain it fully and I found myself grasping at terms making me realize I didn't quite know this technique as well as I thought!"
date: 2025-06-2025
classes: wide
header:
  teaser: /assets/images/kali-logo.png
  teaser_home_page: false
  icon: /assets/images/code.png
categories:
tags:
---

# Background

Kerberoasting - an attack technique first discovered almost a decade ago and yet still remains prevalent as a valid technique for password cracking and pass the hash attacks, enabling privilege escalation and lateral movement within an Active Directory environment.  Due to the popularity of the attack, there have been countless tools already created to scan for and abuse Kerberoasting easily.  Having used this attack before many times in CTFs and while studying for my OSCP I believed that I understood how it worked, but recently I was asked to explain it fully and I found myself grasping at terms making me realize I didn't quite know this technique as well as I thought!

Seeing as kerberoasting is an attack on Microsoft Active Directory's 'Kerberos' authentication protocol, and to understand how the attack works we first must understand how Kerberos authnetication works.

# The Kerberos Authentication Process

Fundamentally, Kerberos is a stateless authentication service used by Windows Active Directory (AD) environments that uses "tickets" for identity management rather than transmitting user passwords over the network.

Here are the primary three components in our authentication process:
* **Client** - The client is the user or computer that is attempting to access a service in the domain.
* **Member Server** - The asset or service that the 'Client' is attempting to access.
* **Domain Controller (DC)** - The logical powerhouse of the domain, and serves as the domain's Key Distribution Server (KDC).  The KDC is responsible for managing authentication and distributing session keys across the domain.

The KDC is comprised of additional components:
* **Kerberos database** - this is the database that stores the necessary authentication information regarding the client and the services that they authenticate to
* **Kerberos Authentication Server (AS)** - Clients use this service to authenticate themselves to get a ticket-granting ticket (TGT).
* **Kerberos Ticket Granting Service (TGS)** - This service accepts Client TGTs for authentication to resources on application servers.

## Kerberos Tickets

As mentioned before, tickets are central to how Kerberos handles authentication across the domain and keeps passwords from being directly communicated across the network and allows for SSO access to multiple services and hosts.



These tickets contain two encryption keys:
* **The ticket key** - Shared between the Kerberos infrastructure and the service requested by the client.
* **The session key** - Shared between the Client and the service requested.  This key is used to encrypte and decrypt communication with the service.



Sources:
https://iam.uconn.edu/the-kerberos-protocol-explained/
https://redsiege.com/tools-techniques/2020/10/detecting-kerberoasting/
https://www.hackthebox.com/blog/what-is-kerberos-authentication
https://iam.uconn.edu/the-kerberos-protocol-explained/
https://web.mit.edu/kerberos/krb5-1.12/doc/admin/database.html 
