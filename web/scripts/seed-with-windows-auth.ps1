param(
    [string]$Server = "localhost",
    [string]$Database = "FlashGuard",
    [string]$InitPath = ".\db\init",
    [string]$CreateOnlyScript = ".\scripts\create-flashguard-db.sql"
)

function Run-SqlFile {
    param($Server, $Database, $File)
    Write-Host "Running $File against $Server [$Database]"
    $args = @('-S', $Server, '-E', '-d', $Database, '-i', $File)
    $proc = Start-Process -FilePath 'sqlcmd' -ArgumentList $args -NoNewWindow -Wait -PassThru -ErrorAction SilentlyContinue
    if (-not $proc) {
        Write-Error "Failed to start sqlcmd. Ensure the SQL Server command-line tools are installed and available in PATH."
        exit 2
    }
    if ($proc.ExitCode -ne 0) {
        Write-Error "sqlcmd returned exit code $($proc.ExitCode) while running $File"
        exit $proc.ExitCode
    }
}

# Ensure sqlcmd exists
if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    Write-Error "sqlcmd not found. Install the SQL Server CLI tools (sqlcmd) or run this from a machine where sqlcmd is available.";
    exit 1
}

$schemaFile = Join-Path $InitPath '01-schema.sql'
$seedFile = Join-Path $InitPath '99-reset-and-seed.sql'

if (Test-Path $schemaFile) {
    # Preferred path: your full schema script handles DB create + tables.
    Run-SqlFile -Server $Server -Database 'master' -File $schemaFile
} elseif (Test-Path $CreateOnlyScript) {
    # Fallback path: just create the target DB if it does not exist.
    Run-SqlFile -Server $Server -Database 'master' -File $CreateOnlyScript
} else {
    Write-Error "No DB creation script found. Expected either $schemaFile or $CreateOnlyScript";
    exit 1
}

# Optional seed step if provided.
if (Test-Path $seedFile) {
    Run-SqlFile -Server $Server -Database $Database -File $seedFile
} else {
    Write-Host "No seed script found at $seedFile. DB creation step completed.";
}

Write-Host "Database seeding complete (server=$Server, database=$Database).";