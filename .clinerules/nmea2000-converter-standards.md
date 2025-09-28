## Brief overview
Rules and standards specific to working with the signalk-to-nmea2000-v2 plugin for Signal K to NMEA 2000 conversions. These guidelines ensure proper CanboatJS format compliance, correct PGN message structure, and effective testing practices.

## CanboatJS message format requirements
- All PGN converters MUST output objects with this exact structure: `{ prio: number, pgn: number, dst: number, fields: { ... } }`
- Required metadata fields: `prio` (usually 2 for data, 6 for control), `dst` (255 for broadcast), `pgn` (Parameter Group Number)
- ALL data fields must be nested under the `fields` object - never as direct properties on the message
- Field names must use camelCase convention (e.g., `windSpeed`, not `"Wind Speed"`)
- Time duration fields (N2K_Duration) should be raw seconds as numbers, not formatted strings

## PGN converter development patterns
- Each converter file in `conversions/` follows the pattern: `module.exports = (_app, _plugin) => { ... }`
- Use embedded test cases with expected CanboatJS format to validate output structure
- Handle multiple data inputs through batteryKeys-style arrays when dealing with complex data sources
- Implement fallback logic for missing data (e.g., `temperature ?? Temperature1`)
- Always include null/undefined validation before processing numeric calculations

## Signal K data derivation strategies
- For battery timeRemaining: calculate from `capacity.remaining / dischargeCurrentA` when not provided directly
- Support both positive and negative current discharge conventions with threshold detection
- Use capacity fallbacks: `capacity.remaining ?? (capacity.actual * stateOfCharge)`
- Cap calculated time values at reasonable maximums (e.g., 30 days) to avoid outliers
- Convert Signal K ratios to percentages where NMEA 2000 expects percent values (multiply by 100)

## Testing and validation approach
- Create comprehensive validation scripts that test actual converter outputs against CanboatJS format
- Test with real Signal K data values, not just synthetic test data
- Validate both successful data conversion and proper null/empty handling
- Use NMEA 2000 log analysis to decode and verify actual transmitted values match expectations
- Check embedded test cases in converters match the actual callback output format

## Format compliance verification
- Run systematic checks across ALL converters, not just individual fixes
- Look for direct properties on message objects (indicates missing fields nesting)
- Verify presence of required metadata fields (prio, dst, pgn)
- Confirm field naming follows camelCase convention throughout
- Test converter outputs programmatically to catch format regressions

## NMEA 2000 PGN data analysis
- Use hex decoding to validate actual NMEA output matches expected values
- Understand that 0xFFFF (N/A) values are correct for unavailable data (e.g., timeRemaining when not discharging)
- Recognize multi-instance scenarios (different battery banks, sensors) require proper instance ID handling
- Decode voltage/current/temperature values using proper scaling factors for validation
