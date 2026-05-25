param(
    [string]$ExcelPath = "D:\CameraRent\assets\Camera Rent Booking Management.xlsx",
    [string]$OutputPath = "D:\CameraRent\supabase\seed.sql"
)

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($ExcelPath)

function New-UUID { return [System.Guid]::NewGuid().ToString() }
function Esc($s) { return ($s + '') -replace "'", "''" }
function NullOrStr($s) { if ($s) { return "'$(Esc $s)'" } else { return "NULL" } }
function ToDate($v) {
    if ($v -is [double]) { return [DateTime]::FromOADate($v).ToString("yyyy-MM-dd") }
    return $null
}

# ── Category map (SKU prefix → DB category) ─────────────────────────────────
$catMap = @{
    CAM='camera'; LNS='lens'; DRN='drone'; LGT='lighting'
    STB='stabilizer'; SUP='support'; ACC='accessory'
    MEM='accessory'; AUD='other'; PWR='accessory'; BAG='accessory'
}

# ── ITEMS ────────────────────────────────────────────────────────────────────
$invSheet = $wb.Sheets["Inventory"]
$invRows  = $invSheet.UsedRange.Rows.Count

$itemRows    = [System.Collections.Generic.List[hashtable]]::new()
$itemByName  = @{}   # exact name  → uuid
$itemBySKU   = @{}   # sku         → uuid

for ($r = 2; $r -le $invRows; $r++) {
    $sku      = $invSheet.UsedRange.Cells($r, 1).Text.Trim()
    $name     = $invSheet.UsedRange.Cells($r, 2).Text.Trim()
    $rateText = $invSheet.UsedRange.Cells($r, 3).Text.Trim()
    $qtyText  = $invSheet.UsedRange.Cells($r, 4).Text.Trim()

    if (-not $sku -or -not $name) { continue }
    if ($sku -match 'f$') { continue }   # skip free-duplicate rows (PWR-003f etc.)

    $prefix   = ($sku -split '-')[0]
    $category = if ($catMap[$prefix]) { $catMap[$prefix] } else { 'other' }
    $rate     = if ($rateText -eq 'Free' -or $rateText -eq '') { '0' } else { $rateText -replace '[^0-9.]','' }
    $qty      = if ($qtyText -match '^\d+$') { $qtyText } else { '1' }

    $uuid = New-UUID
    $itemByName[$name] = $uuid
    $itemBySKU[$sku]   = $uuid
    $itemRows.Add(@{ id=$uuid; sku=$sku; name=$name; cat=$category; rate=$rate; qty=$qty })
}

# ── CUSTOMERS ────────────────────────────────────────────────────────────────
$custSheet = $wb.Sheets["Customer"]
$custRows  = $custSheet.UsedRange.Rows.Count

$customers    = [System.Collections.Generic.List[hashtable]]::new()
$custByXlsId  = @{}   # excel integer ID → uuid

for ($r = 2; $r -le $custRows; $r++) {
    $xId   = $custSheet.UsedRange.Cells($r, 1).Text.Trim()
    $name  = $custSheet.UsedRange.Cells($r, 2).Text.Trim()
    $ph1        = $custSheet.UsedRange.Cells($r, 3).Text.Trim()
    $secondNum  = $custSheet.UsedRange.Cells($r, 4).Text.Trim()
    $nic        = $custSheet.UsedRange.Cells($r, 5).Text.Trim()
    $addr       = $custSheet.UsedRange.Cells($r, 6).Text.Trim()
    $homeNum    = $custSheet.UsedRange.Cells($r, 8).Text.Trim()
    # Use Second Number first, fall back to Home Contact
    $ph2        = if ($secondNum) { $secondNum } elseif ($homeNum) { $homeNum } else { '' }

    if (-not $xId -or -not $name)     { continue }
    if ($xId -eq '100')               { continue }   # owner row, skip
    if ($nic -eq 'me')                { $nic = '' }  # sanitise

    # Excel drops leading 0 from phone numbers stored as numbers
    if ($ph1 -match '^\d{9}$') { $ph1 = '0' + $ph1 }
    if ($ph2 -match '^\d{9}$') { $ph2 = '0' + $ph2 }

    $uuid     = New-UUID
    $custCode = 'CUS-' + $xId.PadLeft(3,'0')
    $custByXlsId[$xId] = $uuid
    $customers.Add(@{ id=$uuid; code=$custCode; name=$name; ph1=$ph1; ph2=$ph2; nic=$nic; addr=$addr })
}

# ── BOOKINGS ─────────────────────────────────────────────────────────────────
$bkSheet = $wb.Sheets["Bookings"]
$bkRows  = $bkSheet.UsedRange.Rows.Count

$bookings       = [System.Collections.Generic.List[hashtable]]::new()
$currentBooking = $null

for ($r = 2; $r -le $bkRows; $r++) {
    $idText    = $bkSheet.UsedRange.Cells($r, 1).Text.Trim()
    $custXlsId = $bkSheet.UsedRange.Cells($r, 2).Text.Trim()
    $itemName  = $bkSheet.UsedRange.Cells($r, 4).Text.Trim()
    $startVal  = $bkSheet.UsedRange.Cells($r, 5).Value2
    $endVal    = $bkSheet.UsedRange.Cells($r, 6).Value2
    $priceText = $bkSheet.UsedRange.Cells($r, 7).Text.Trim()
    $statusTxt = $bkSheet.UsedRange.Cells($r, 8).Text.Trim()
    $totalText = $bkSheet.UsedRange.Cells($r, 9).Text.Trim()

    if ($idText -match '^\d+$') {
        # Save previous booking
        if ($currentBooking) { $bookings.Add($currentBooking) }

        $startDate = if ($startVal) { ToDate $startVal } else { $null }
        $endDate   = if ($endVal)   { ToDate $endVal   } else { $startDate }
        if (-not $endDate) { $endDate = $startDate }

        # Derive status from actual dates (Excel status text is unreliable for past bookings)
        $today = (Get-Date).Date
        $dbStatus = if ($endDate -and ([DateTime]::Parse($endDate)) -lt $today) {
            'completed'
        } elseif ($startDate -and ([DateTime]::Parse($startDate)) -le $today) {
            'active'
        } else {
            'upcoming'
        }
        $totalNum  = if ($totalText -match '^\d') { [decimal]$totalText } else { 0 }

        $currentBooking = @{
            id         = New-UUID
            code       = "BK-$idText"
            custXlsId  = $custXlsId
            startDate  = $startDate
            endDate    = $endDate
            status     = $dbStatus
            totalPrice = $totalNum
            items      = [System.Collections.Generic.List[hashtable]]::new()
        }

        # First item on the booking header row
        if ($itemName) {
            $isFree = ($priceText -eq 'Free')
            $rate   = if ($isFree -or -not $priceText) { 0 } else { [decimal]($priceText -replace '[^0-9.]','') }
            $currentBooking.items.Add(@{ name=$itemName; rate=$rate; isFree=$isFree })
        }
    }
    elseif ($currentBooking -and $itemName) {
        $isFree = ($priceText -eq 'Free')
        $rate   = if ($isFree -or -not $priceText) { 0 } else {
            $s = $priceText -replace '[^0-9.]',''
            if ($s) { [decimal]$s } else { 0 }
        }
        $currentBooking.items.Add(@{ name=$itemName; rate=$rate; isFree=$isFree })
    }
}
if ($currentBooking) { $bookings.Add($currentBooking) }

$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($wb) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null

# ── BUILD SQL ─────────────────────────────────────────────────────────────────
$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("-- ================================================================")
$lines.Add("-- Camera Rent Embilipitiya — Database Seed")
$lines.Add("-- Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
$lines.Add("-- Run this in the Supabase SQL Editor (Settings → SQL Editor)")
$lines.Add("-- ================================================================")
$lines.Add("")
$lines.Add("-- Fix category constraint to include all real categories")
$lines.Add("ALTER TABLE items DROP CONSTRAINT IF EXISTS items_category_check;")
$lines.Add("ALTER TABLE items ADD CONSTRAINT items_category_check")
$lines.Add("  CHECK (category IN ('camera','lens','accessory','lighting','drone','stabilizer','support','other'));")
$lines.Add("")
$lines.Add("-- Clear any existing test data (safe to re-run)")
$lines.Add("TRUNCATE booking_items CASCADE;")
$lines.Add("TRUNCATE bookings   CASCADE;")
$lines.Add("TRUNCATE customers  CASCADE;")
$lines.Add("TRUNCATE items      CASCADE;")
$lines.Add("")

# Items
$lines.Add("-- ── ITEMS ($($itemRows.Count) items) ──────────────────────────────")
$itemSql = $itemRows | ForEach-Object {
    "  ('$($_.id)','$(Esc $_.sku)','$(Esc $_.name)','$($_.cat)',$($_.rate),$($_.qty))"
}
$lines.Add("INSERT INTO items (id, sku, name, category, daily_rate, quantity) VALUES")
$lines.Add(($itemSql -join ",`n") + ";")
$lines.Add("")

# Customers
$lines.Add("-- ── CUSTOMERS ($($customers.Count) customers) ──────────────────────")
$custSql = $customers | ForEach-Object {
    "  ('$($_.id)','$(Esc $_.code)','$(Esc $_.name)','$(Esc $_.ph1)',$(NullOrStr $_.ph2),$(NullOrStr $_.nic),$(NullOrStr $_.addr),NULL)"
}
$lines.Add("INSERT INTO customers (id, customer_code, full_name, phone, phone_secondary, nic, address, id_photo_url) VALUES")
$lines.Add(($custSql -join ",`n") + ";")
$lines.Add("")

# Bookings + booking_items
$lines.Add("-- ── BOOKINGS ($($bookings.Count) bookings) ──────────────────────────")
$skippedBookings = 0
foreach ($b in $bookings) {
    $custUuid = $custByXlsId[$b.custXlsId]
    if (-not $custUuid -or -not $b.startDate) { $skippedBookings++; continue }

    # Recalculate total from items if missing
    $total = $b.totalPrice
    if ($total -eq 0 -and $b.items.Count -gt 0) {
        try {
            $s    = [DateTime]::Parse($b.startDate)
            $e    = [DateTime]::Parse($b.endDate)
            $days = [Math]::Max(1, ($e - $s).Days + 1)
            $total = ($b.items | ForEach-Object { $_.rate } | Measure-Object -Sum).Sum * $days
        } catch { $total = 0 }
    }

    # Past bookings are paid in cash; today or future are pending
    $today          = Get-Date -Format 'yyyy-MM-dd'
    $paymentStatus  = if ($b.endDate -lt $today) { 'paid'    } else { 'pending' }
    $paymentMethod  = if ($b.endDate -lt $today) { '''cash''' } else { 'NULL'    }
    # created_at = start_date for past bookings; today for future ones
    $createdAt      = if ($b.startDate -le $today) { $b.startDate } else { $today }

    $lines.Add("INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)")
    $lines.Add("  VALUES ('$($b.id)','$(Esc $b.code)','$custUuid','$($b.startDate)','$($b.endDate)',$total,'$($b.status)','$paymentStatus',$paymentMethod,0,'$createdAt');")

    foreach ($item in $b.items) {
        $isFreeStr = if ($item.isFree) { 'true' } else { 'false' }

        # Resolve item UUID: direct name → strip Free prefix → special aliases
        $itemUuid = $itemByName[$item.name]
        if (-not $itemUuid) {
            $cleanName = $item.name -replace '^Free[-_\s]+', ''
            $itemUuid  = $itemByName[$cleanName]
        }
        if (-not $itemUuid -and $item.name -match 'Side Bag')  { $itemUuid = $itemBySKU['BAG-001'] }
        if (-not $itemUuid -and $item.name -match 'Lense? Bag') { $itemUuid = $itemBySKU['BAG-002'] }

        if ($itemUuid) {
            $lines.Add("INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)")
            $lines.Add("  VALUES ('$(New-UUID)','$($b.id)','$itemUuid',NULL,1,$($item.rate),$isFreeStr);")
        } else {
            $lines.Add("INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)")
            $lines.Add("  VALUES ('$(New-UUID)','$($b.id)',NULL,'$(Esc $item.name)',1,$($item.rate),$isFreeStr);")
        }
    }
    $lines.Add("")
}

$lines | Set-Content -Path $OutputPath -Encoding UTF8

Write-Output ""
Write-Output "=== GENERATED: $OutputPath ==="
Write-Output "  Items:     $($itemRows.Count)"
Write-Output "  Customers: $($customers.Count)"
Write-Output "  Bookings:  $($bookings.Count) (skipped $skippedBookings without customer match)"
