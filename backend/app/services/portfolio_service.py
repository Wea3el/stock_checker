from app.models.schemas import Holding, PortfolioSummary
from app.utils.csv_parser import parse_fidelity_csv

# In-memory portfolio state (single-user tool)
_holdings: list[Holding] = []


def upload_portfolio(file_content: bytes) -> list[Holding]:
    global _holdings
    _holdings = parse_fidelity_csv(file_content)
    return _holdings


def get_holdings() -> list[Holding]:
    return _holdings


def get_summary() -> PortfolioSummary:
    total_value = sum(h.current_value for h in _holdings)
    total_cost = sum(h.cost_basis_total for h in _holdings)
    total_gain = sum(h.gain_loss_dollar for h in _holdings)
    total_pct = (total_gain / total_cost * 100) if total_cost else 0.0

    return PortfolioSummary(
        total_value=round(total_value, 2),
        total_gain_loss=round(total_gain, 2),
        total_gain_loss_percent=round(total_pct, 2),
        num_holdings=len(_holdings),
        holdings=_holdings,
    )


def get_tickers() -> list[str]:
    return list({h.symbol for h in _holdings if h.symbol})
