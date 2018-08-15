---
title: Virtualised XCP-ng Homelab
tags: servers xen homelab xcp-ng
---

This is a Guide For Setting Up and Securing Your Own Home Lab Based On [XCP-ng](https://xcp-ng.org).

# Hardware
The First Step In Building Your Homelab Is Deciding What Hardware You Are Going To Run it On. The Main Factors Going Into The Dision Are:
* Power Usage
* Noise (Depending On Where It Is Deployed)
* Purchase Price

I Decided On An Intel [NUC](https://www.intel.com/content/www/us/en/products/boards-kits/nuc.html) Because Of Its Low Noise and Power Usage. I Bought A Weaker Speced Model To Keep The Purchasing Price Down But This Has Created An Issue For Running CPU Heavy Applications Because The Celeron It Has Can't Keep Up.

# Software Planning
So Now That You Have The Hardware You Next Need To Plan How You Are Going To Set it Up. I Have Decided On Using [XCP-ng](https://xcp-ng.org). It Is An Open Source Hypervisor Based Of Citrix Xenserver. I Really Like It And When Paired With [Xen Orchestra](https://xen-orchestra.com) Which Gives A Beautiful Managment Interface It is Super Easy To Use And Maintain.

# Security Planning
For Keeping The Server Secure I Am Going To Be Used OSSEC For Monitoring The VM's And SSH Keys Because They Are Alot More Secure Than Passwords. I Am Going To Be Using [Krypton](https://krypt.co) For Keeping My SSH Keys Secure On My Phone.

# Generating Passwords
For Security I Use A Random Password For My Xenserver Host. It Is 22 Characters Long. To Generate This Password I Ran The Command Below 3 Times And Randomly Chose Characters From The Strings Until I Had 22 Characters. You Should Write This Password Down But Remember To Keep It In a Safe And Secure Location.

```bash
openssl rand -base64 32
```

# Software Setup
Now That Planning Is Done It Is Time To Setup The Software On The Server.
## Install XCP-ng On The Host
Navigate to [Here](https://xcp-ng.org/download/) And Download And Install The ISO On Your Server. You Can [Etcher](https://etcher.io) To Burn The ISO To A USB. On The XCP-ng Download Page There Is An Installation Guide If You Scroll Down. Use The Password From Above As Your Root Password.

## Custom Configuration
The First Step In Setting Up Your Server is SSHing In to Setup The Configuration. Below Is The Configuration I Use And You Can Modify It For Your Setup.

```bash
ssh root@
```

via SSH

Setup and Test Kryton

Button
```bash
wget -O acpid.rpm http://mirror.centos.org/centos/7/os/x86_64/Packages/acpid-2.0.19-9.el7.x86_64.rpm
yum -y install acpid.rpm
rm -rf acpid.rpm
service acpid start
chkconfig acpid on
```

LEGO (Lets Encypt Software)
```bash
wget https://github.com/xenolf/lego/releases/download/v1.0.1/lego_v1.0.1_linux_amd64.tar.gz
tar -zxvf "lego_v1.0.1_linux_amd64.tar.gz" "lego"
mv lego /usr/local/bin
```

Issue Letsencypt Cert

Show Manule Using HTTPS Instead
```bash
export NAMECHEAP_API_USER=""
export NAMECHEAP_API_KEY=""
lego --accept-tos --dns=namecheap --path=/lego --email=$EMAIL --domains=$DOMAIN run
```

Setup Xen To Use The Cert
```bash
nano /etc/pki/tls/openssl.cnf
  # Uncomment The Line '# req_extensions = v3_req'
  # Modify The Section '[ v3_req ]' With The Following
    #basicConstraints = CA:FALSE
    #keyUsage = keyEncipherment
    #extendedKeyUsage = serverAuth
mv /etc/xensource/xapi-ssl.pem /etc/xensource/xapi-ssl.pem_orig
cat /lego/certificates/lan.xen.otbeaumont.me.crt /lego/certificates/lan.xen.otbeaumont.me.key > /etc/xensource/xapi-ssl.pem
xe-toolstack-restart

```

Setup Xen ISO Library
```bash
mkdir -p /iso_lib
xe sr-create name-label="Xen Operating Systems" type=iso device-config:location=/iso_lib device-config:legacy_mode=true content-type=iso
```

Crontab
```bash
crontab -e
  # @reboot yum -y update --skip-broken > /var/logs/startup-update-`date +\%Y\%m\%d\%H\%M\%S`.log 2>&1
  # 30 2 * * * "$(command -v bash)" -c '/usr/local/bin/$ISSUE_COMMAND renew --days 30 && cat /lego/certificate/mdm.otbeaumont.me.crt /lego/certificate/mdm.otbeaumont.me.key > /etc/xensource/xapi-ssl.pem && xe-toolstack-restart' > /var/logs/startup-lego-`date +\%Y\%m\%d\%H\%M\%S`.log 2>&1
```

Secure SSH
```bash
nano /etc/ssh/sshd_config
  #PermitRootLogin		yes
  #PasswordAuthentication	no
  #UsePAM			no
systemctl restart sshd
```


This Is The Documentation For The Software On My Home Server. It Is Setup First By Install [XCP-ng](https://xcp-ng.org).

# XCP-ng Host
The First Step Is To Install XCP-ng Onto Your Server. Your Can Download It [From Here](https://xcp-ng.org/download) And Burn It To A USB Using A Tool Like [Etcher](https://etcher.io). One Booted And You Are Logged Into The Console You Can Use SSH or Remove Access If You Want.

```bash


```

Deploy XOA

```bash
bash -c "$(curl -s http://xoa.io/deploy)"
```

# Debian Base VM

Setup SSH Keys

Xen Tools
```bash
mount
bash /mnt/Linux/install.sh
```

Utils
```bash
apt update
apt upgrade
apt dist-upgrade
apt install git htop curl ufw
```


# OSSEC VM

# Xen Orchestra Community

DDNS
```bash
nano /opt/ddns.sh
chmod +x /opt/ddns.sh
#Put The Content From Git
```

# Backups
3, 2, 1
SSH Keys Backups


```bash
curl https://raw.githubusercontent.com/Jarli01/xenorchestra_installer/master/xo_install.sh | bash
```



Check Crontab Is Working On Xen
