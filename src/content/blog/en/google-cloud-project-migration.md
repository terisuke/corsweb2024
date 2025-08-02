---
title: "How Migrating an Entire Google Cloud Project Between Organizations Finished in One Day"
description: "The tearful record of a developer who, after meticulously creating scripts to migrate GCS objects, discovered that projects themselves could be moved."
pubDate: 2025-07-24
author: "Terisuke"
category: "engineering"
tags: ["Google Cloud", "DevOps", "移行", "gcloud", "プロジェクト管理"]
image:
  url: "/images/blog/gcp-logo.avif"
  alt: "Google Cloud Platform logo"
lang: "en"
featured: false
---
# The Time I Moved an Entire Google Cloud Project Between Organizations and Finished in One Day

Hello, it's Terisuke.

Today, I want to talk about **how I completely wasted a lot of time**.

As part of organizing our company's cloud environment, we needed to move projects managed under `company@example-a.com` to the organization of `company@example-b.com`.

At first, I was determined, thinking, "Alright, I'll use Terraform and gcloud to meticulously migrate GCS buckets and Compute Engine instances one by one!" ... but then,

**I learned that if you're within the same Google Cloud, there's a way to move entire projects at once.**

As a result, the GCS migration scripts I painstakingly created became completely useless (cry).

However, to avoid stepping on the same rake, I'm summarizing the method here as a personal memo.

## Prerequisites (This is Important)

First, you need to meet the following conditions:

- ✅ You have Owner permissions for both organizations.
- ✅ The project to be migrated is not using VPC Service Controls or Shared VPC.
- ✅ You are not using any paid services from the Marketplace (these will need to be repurchased).

## Migration Flow (Actual Steps Taken)

### 1. Confirm Organization IDs

First, confirm the organization IDs of the source and destination. This is crucial for later configurations.

```bash
# Log in to the source organization
gcloud config set account company@example-a.com
gcloud organizations list
# DISPLAY_NAME     ID             DIRECTORY_CUSTOMER_ID
# example-a.com    123456789012   C02xxxxxx

# Log in to the destination organization
gcloud config set account company@example-b.com
gcloud organizations list
# DISPLAY_NAME     ID             DIRECTORY_CUSTOMER_ID
# example-b.com    987654321098   C02yyyyyy
```

### 2. Pre-Migration Checks (Getting stuck here is troublesome)

Before migrating, let's confirm the following. It's a real pain when you realize an error after it happens.

```bash
# Check for VPC Service Controls (if an error occurs, it's okay)
gcloud access-context-manager perimeters list

# Check for Shared VPC (if {} is returned, it's okay)
gcloud compute shared-vpc get-host-project your-project-id

# Note the current billing account
gcloud beta billing projects describe your-project-id
```

### 3. Configure the Migration Corridor (This is the Key)

This is the most important part. We establish a "migration corridor" to enable project movement between organizations. In essence, it's a setting to make the organizations trust each other.

**Set export permission in the source organization:**
```bash
# Create export-policy.yaml
cat > export-policy.yaml << EOF
name: organizations/123456789012/policies/resourcemanager.allowedExportDestinations
spec:
  rules:
    - values:
        allowedValues:
          - under:organizations/987654321098
EOF

# Apply the policy
gcloud org-policies set-policy export-policy.yaml
```

**Set import permission in the destination organization:**
```bash
# Log in to the destination organization
gcloud config set account company@example-b.com

# Create import-policy.yaml
cat > import-policy.yaml << EOF
name: organizations/987654321098/policies/resourcemanager.allowedImportSources
spec:
  rules:
    - values:
        allowedValues:
          - under:organizations/123456789012
EOF

# Apply the policy
gcloud org-policies set-policy import-policy.yaml
```

### 4. Grant Permissions (This is where I got stuck)

Even with organization owner permissions, project-level permissions were necessary. I only realized this after encountering an error, but the following permissions are required.

```bash
# Switch back to the source account
gcloud config set account company@example-a.com

# Grant permissions to the project and organization
gcloud projects add-iam-policy-binding your-project-id \
    --member="user:company@example-a.com" \
    --role="roles/resourcemanager.projectMover"

gcloud organizations add-iam-policy-binding 123456789012 \
    --member="user:company@example-a.com" \
    --role="roles/resourcemanager.projectMover"

# Grant permissions to the destination organization as well (cross-organization permission grant)
gcloud config set account company@example-b.com
gcloud organizations add-iam-policy-binding 987654321098 \
    --member="user:company@example-a.com" \
    --role="roles/resourcemanager.projectCreator"
```

### 5. The Actual Migration (Just One Command!)

Once preparations are complete, you can migrate with a single command.

```bash
# Execute with the source account
gcloud config set account company@example-a.com
gcloud beta projects move your-project-id --organization 987654321098
```

A warning will appear, but proceed by typing `Y`. **The migration was completed in less than a minute.** I was taken aback by how fast it was.

### 6. Change Billing Account (Forgetting this is a big problem)

The project moved, but the billing account doesn't change automatically. If you forget this, billing will continue to be sent to the old organization.

```bash
# Switch to the destination account
gcloud config set account company@example-b.com

# Link to the new billing account
gcloud beta billing accounts list
gcloud beta billing projects link your-project-id --billing-account NEW-BILLING-ID
```

I encountered permission errors here as well, so I had to grant project owner permissions to the destination account.

```bash
# Execute with the source account
gcloud config set account company@example-a.com
gcloud projects add-iam-policy-binding your-project-id \
    --member="user:company@example-b.com" \
    --role="roles/owner"
```

### 7. Cleanup (Extremely Important)

Close the "security holes" opened for migration. If you forget this, projects will remain movable between organizations at will.

```bash
# Delete organization policies
gcloud config set account company@example-a.com
gcloud org-policies delete resourcemanager.allowedExportDestinations --organization=123456789012

gcloud config set account company@example-b.com
gcloud org-policies delete resourcemanager.allowedImportSources --organization=987654321098

# Delete cross-organization permissions as well
gcloud organizations remove-iam-policy-binding 987654321098 \
    --member="user:company@example-a.com" \
    --role="roles/resourcemanager.projectCreator"
```

## Post-Migration Considerations

- **Inherited IAM policies** will be lost. Permissions granted at the organization level will need to be reconfigured.
- **Budget alerts** also need to be reconfigured. Budget settings are not carried over to the new billing account.
- **Service functionality checks** are mandatory. Pay close attention to services with external integrations.

## The Punchline: My Useless GCS Migration Script

When I started the migration work, I had actually created a script to migrate GCS buckets via local transfer.

https://github.com/terisuke/gcs-migration-project

I had implemented parallel downloads, progress display, and error handling, thinking, "Now I can easily migrate large numbers of buckets!" ... but then,

The moment I learned that **projects could be moved as a whole**, everything became a waste.

But well, it was a good learning experience for parallel processing with `gsutil` and GCS operations in Python, and it's still usable if you can't cross organizations, so it wasn't a complete waste... I keep telling myself that.

## Summary

Google Cloud project migration was surprisingly easy, provided you have the correct permissions and configurations. However, don't forget to clean up security settings.

If anyone else is undertaking a similar migration, I recommend investigating the existence of `gcloud beta projects move` from the start. Reinventing the wheel can be fun, but time is finite.

Still, I wish I could get back those three days I spent creating that GCS migration script.

---

**Thank you for reading!**

If you've had a similar experience, or are planning a migration, please let me know in the comments. Let's cry together (lol).