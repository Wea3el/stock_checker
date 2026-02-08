import io
import math
import pandas as pd
from app.models.schemas import Holding


def _clean_currency(value: str) -> float:
    """Remove $, commas, and percentage signs, return float."""
    if not isinstance(value, str):
        f = float(value) if pd.notna(value) else 0.0
        return 0.0 if math.isnan(f) or math.isinf(f) else f
    cleaned = value.replace("$", "").replace(",", "").replace("%", "").replace("+", "").strip()
    if cleaned in ("", "--", "n/a", "nan", "NaN", "inf", "-inf"):
        return 0.0
    try:
        f = float(cleaned)
        return 0.0 if math.isnan(f) or math.isinf(f) else f
    except ValueError:
        return 0.0


def _get_col(row: pd.Series, candidates: list[str], default: str = "") -> str:
    """Try multiple column name variants, return first match."""
    for col in candidates:
        if col in row.index and pd.notna(row[col]):
            return str(row[col]).strip()
    return default


def parse_fidelity_csv(file_content: bytes) -> list[Holding]:
    """Parse a Fidelity Portfolio_Positions CSV export into Holding models."""
    text = file_content.decode("utf-8-sig")

    # Fidelity CSVs have footer/disclaimer rows after the data.
    lines = text.splitlines()
    data_lines: list[str] = []
    for line in lines:
        stripped = line.strip().strip(",")
        if stripped == "" or stripped.startswith('"') or stripped.startswith("The data"):
            break
        data_lines.append(line)

    if not data_lines:
        return []

    csv_text = "\n".join(data_lines)
    df = pd.read_csv(io.StringIO(csv_text), index_col=False)

    # Normalize column names: strip whitespace
    df.columns = [col.strip() for col in df.columns]
    # Drop any fully unnamed columns (from trailing commas)
    df = df.loc[:, ~df.columns.str.startswith("Unnamed")]

    holdings: list[Holding] = []
    for _, row in df.iterrows():
        symbol = _get_col(row, ["Symbol"])
        # Skip cash positions, money market, and invalid rows
        if not symbol or symbol in ("nan", "Pending Activity") or "**" in symbol:
            continue

        # Build account string from separate Account Number / Account Name columns
        acct_num = _get_col(row, ["Account Number"])
        acct_name = _get_col(row, ["Account Name", "Account Name/Number"])
        account = f"{acct_name} ({acct_num})" if acct_name and acct_num else acct_name or acct_num

        holdings.append(
            Holding(
                account=account,
                symbol=symbol,
                description=_get_col(row, ["Description"]),
                quantity=_clean_currency(_get_col(row, ["Quantity"])),
                last_price=_clean_currency(_get_col(row, ["Last Price"])),
                current_value=_clean_currency(_get_col(row, ["Current Value"])),
                cost_basis_total=_clean_currency(_get_col(row, ["Cost Basis Total"])),
                gain_loss_dollar=_clean_currency(_get_col(row, ["Total Gain/Loss Dollar"])),
                gain_loss_percent=_clean_currency(_get_col(row, ["Total Gain/Loss Percent"])),
            )
        )

    return holdings
