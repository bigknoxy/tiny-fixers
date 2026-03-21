# GitHub API Commands

## Branch Protection

Set up branch protection for `main`:

```bash
gh api -X PUT repos/<owner>/<repo>/branches/main/protection --input - << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["lint", "typecheck", "build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false
}
EOF
```

### Parameters

- `enforce_admins: false` - Allows repo admins to push directly
- `required_approving_review_count: 1` - Requires 1 approval
- `dismiss_stale_reviews: true` - Dismisses approvals when new commits are pushed
- `contexts: ["lint", "typecheck", "build"]` - Required CI checks

### Updating Required Checks

If CI checks have different names (e.g., from a matrix or reusable workflow):

```bash
gh api -X PUT repos/<owner>/<repo>/branches/main/protection/required_status_checks/contexts \
  -f "contexts[]=lint" \
  -f "contexts[]=typecheck" \
  -f "contexts[]=build"
```

## GitHub Pages

### Enable GitHub Pages

```bash
gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow
```

This enables Pages with GitHub Actions as the build source.

### Check Pages Status

```bash
gh api repos/<owner>/<repo>/pages
```

Returns the Pages URL in `html_url` field.

## Semantic Release Notes

### Manual Release Trigger

If you need to trigger a release manually:

```bash
gh workflow run release.yml
```

### Check Recent Releases

```bash
gh release list
gh release view <tag>
```

### Create Initial Release

If semantic-release hasn't created a release yet (no conventional commits found), you can create one manually:

```bash
gh release create v1.0.0 --title "v1.0.0" --notes "Initial release"
```

## Troubleshooting

### Reset Branch Protection

To remove all protection rules:

```bash
gh api -X DELETE repos/<owner>/<repo>/branches/main/protection
```

### Check Workflow Runs

```bash
gh run list --limit 10
gh run view <run-id>
gh run watch <run-id>
```

### Re-run Failed Workflow

```bash
gh run rerun <run-id>
```
