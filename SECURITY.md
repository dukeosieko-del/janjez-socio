# SECURITY WARNING

## 🔴 ROTATE YOUR RSA PRIVATE KEY IMMEDIATELY

You pasted an RSA private key in plain text. Even though this conversation may be private,
treat it as compromised and rotate it now:

1. Generate a new key pair:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "deploy@janjez" -f ~/.ssh/janjez-deploy
   ```

2. Add the new public key to your EC2 instance:
   ```bash
   ssh-copy-id -i ~/.ssh/janjez-deploy.pub ec2-user@<your-ec2-ip>
   ```

3. Remove the old key from `~/.ssh/authorized_keys` on the EC2 instance.

4. Delete the old private key from anywhere it was stored.

## 🔐 Supabase Service Role Key

The JWT token you provided is a **service_role** key with admin-level access.
Never commit it to git. Store it only in `.env.local` (gitignored) or Vercel/EC2 env vars.

Current location: `.env.local` (gitignored)
