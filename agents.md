# Agents Plan

## Implementation Agent
- Build and maintain a Next.js + TypeScript MVP for Korean apartment recommendations.
- Keep user-facing inputs ergonomic for Korean real estate users, including area input in pyeong while retaining square-meter calculations internally.
- Preserve the provider boundary for real transaction-price and mortgage-product APIs.

## Testing Agent
- Run unit tests for validation, finance calculations, providers, recommendation ranking, and the main UI flow after each feature change.
- Prefer fixture/parser tests for real API adapters so tests do not depend on network access or API keys.

## Integration Agent
- Treat Mock providers as the default local data source.
- Add real API adapters behind the existing provider interfaces only when API keys and official response schemas are confirmed.

## API Integration Agent
- Keep Mock providers as the default local mode.
- Use real providers only when API keys and explicit `USE_REAL_*` flags are present.
- Never silently fall back to Mock data in real API mode; surface provider errors clearly.
