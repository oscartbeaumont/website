---
title: Handy Linux Commands
date: 2018-06-01 21:53:44
---

# This is a work in progress and is not complete yet

[System Status](#testing)
System Network Details system-details
Software software

{% raw %}
<script>
var objDiv = document.getElementById("software");
objDiv.scrollTop = objDiv.scrollHeight;
</script>
{% endraw %}



{% raw %}<div id="system-status-commands">{% endraw %}
# System Status Commands
Process Monitoring:
{% code lang:bash %}
htop
{% endcode %}

RAM Usage:
{% code lang:bash %}
free -m
{% endcode %}

{% raw %}</div>{% endraw %}
{% raw %}<div id="system-details">{% endraw %}
# Change System/Network Details
Static IP Address's:
{% code lang:bash %}
sudo nano /etc/network/interfaces
   auto eth0
   iface eth0 inet static
   address 192.168.1.100
   netmask 255.255.255.0
   network 192.168.1.0
   broadcast 192.168.1.255
   gateway 192.168.1.1
   dns-nameservers 192.168.1.1
{% endcode %}

Restart Network Stack:
{% code lang:bash %}
sudo /etc/init.d/networking restart
{% endcode %}

Hostname:
{% code lang:bash %}
sudo sed -i 's/$(cat /etc/hostname)/new-hostname/g' /etc/hosts
sudo sed -i 's/$(cat /etc/hostname)/new-hostname/g' /etc/hostname
{% endcode %}
Please Reboot Now

{% raw %}</div>{% endraw %}
{% raw %}<div id="software">{% endraw %}

# Software
Ubuntu/Debian Updates:
{% code lang:bash %}
sudo apt update && sudo apt -y upgrade
{% endcode %}

{% raw %}</div>{% endraw %}

# SSH Key Handling

generation

copying

# Linux User Commands
Create A New User:
{% code lang:bash %}
sudo adduser sammy
{% endcode %}

Delete A User (Including Home Directory):
{% code lang:bash %}
sudo userdel -r sammy <font color='red'>bar</font>
{% endcode %}

Give User Sudo:
{% code lang:bash %}
sudo usermod -aG sudo sammy
{% endcode %}




TODO:
 Username Sammy (Change To Red Color)
 Interface eth0 (Change To Red Color)
 IP Address's eth0 (Change To Red Color)
 new-hostname (Change To Red Color)

foo <font color='red'>bar</font> foo

​
