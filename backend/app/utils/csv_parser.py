import io
import pandas as pd
from app.models.schemas import Holding


def _clean_currency(value: str) -> float:
    """Remove $, commas, and percentage signs, return float."""
    if not isinstance(value, str):
        return float(value) if pd.notna(value) else 0.0
    cleaned = value.replace("$", "").replace(",", "").replace("%", "").replace("+", "").strip()
    if cleaned in ("", "--", "n/a"):
        return 0.0
    return float(cleaned)


def parse_fidelity_csv(file_content: bytes) -> list[Holding]:
    """Parse a Fidelity Portfolio_Positions CSV export into Holding models."""
    text = file_content.decode("utf-8-sig")

    # Fidelity CSVs sometimes have footer/disclaimer rows after the data.
    # Find where actual data ends by looking for blank lines or disclaimer text.
    lines = text.splitlines()
    data_lines: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped == "" or stripped.startswith("The data and information"):
            break
        data_lines.append(line)

    if not data_lines:
        return []

    csv_text = "\n".join(data_lines)
    df = pd.read_csv(io.StringIO(csv_text))

    # Normalize column names: strip whitespace
    df.columns = [col.strip() for col in df.columns]

    # Map Fidelity column names to our schema
    col_map = {
        "Account Name/Number": "account",
        "Account Number": "account",
        "Symbol": "symbol",
        "Description": "description",
        "Quantity": "quantity",
        "Last Price": "last_price",
        "Last Price Change": "_skip",
        "Current Value": "current_value",
        "Today's Gain/Loss Dollar": "_skip",
        "Today's Gain/Loss Percent": "_skip",
        "Total Gain/Loss Dollar": "gain_loss_dollar",
        "Total Gain/Loss Percent": "gain_loss_percent",
        "Cost Basis Total": "cost_basis_total",
        "Cost Basis Per Share": "_skip",
        "Type": "_skip",
    }

    holdings: list[Holding] = []
    for _, row in df.iterrows():
        symbol = str(row.get("Symbol", "")).strip()
        # Skip cash positions and invalid rows
        if not symbol or symbol in ("", "Pending Activity") or "**" in symbol:
            continue

        holding_data: dict = {"symbol": symbol}
        for csv_col, field_name in col_map.items():
            if csv_col in df.columns and field_name not in ("_skip", "symbol"):
                raw_val = row.get(csv_col, "")
                if field_name in ("account", "description"):
                    holding_data[field_name] = str(raw_val).strip() if pd.notna(raw_val) else ""
                else:
                    holding_data[field_name] = _clean_currency(str(raw_val))

        holdings.append(Holding(**holding_data))

    return holdings
