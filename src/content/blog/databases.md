---
title: Databases, database, and more database
description: TODO # TODO
date: 2024-04-17 # TODO
draft: true # TODO
---

Providers:
 - Planetscale

 - AWS RDS

 - Neon
 - Supabase

 - Turso
 - Cloudflare D1

 - Railway
 - DigitalOcean

 - Hetnzer 5$ machine
   - but software updates, backups, etc

Break down:
 - Pricing
 - Features
   - Branching (schema vs data)
     - Branch locations?
       - You *need* a dev branch near you, not prod (because of round-trip time)
       - How hard is to run locally? Does it require Docker???
   - Backups
   - Read-replica's???
   - Online DDL




My problems with existing solutions:
 - Dev branching is expensive and I don't wanna run Docker locally
 - Read-replica's would be nice without being an enterprise

Is scale to zero MySQL possible???