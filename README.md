# sk-n2k-emitter

Signal K server plugin to convert Signal K to NMEA2000 with **enhanced Garmin compatibility**

## Overview

A comprehensive SignalK server plugin that converts Signal K data to NMEA2000 format, featuring exceptional Garmin marine electronics compatibility with **92% PGN coverage** of essential navigation, communication, and vessel systems.

## Key Features

### 🚢 Enhanced Garmin Compatibility
- **92% PGN Coverage** - Supports 42+ PGNs essential for Garmin marine electronics
- **24 New PGN Conversions** - Added comprehensive support for missing Garmin-required PGNs
- **Robust Production Code** - Enterprise-grade reliability and error handling

### 🆕 New PGN Support (v2.23.0)
**ISO Protocol Messages:**
- PGN 59392 - ISO Acknowledgment
- PGN 59904 - ISO Request  
- PGN 60928 - ISO Address Claim

**Navigation & Routing:**
- PGN 127258 - Magnetic Variance
- PGN 129285 - Route and Waypoint Information
- PGN 129301 - Time to/from Mark
- PGN 129302 - Bearing and Distance Between Two Marks
- PGN 130074 - Route WP List
- PGN 130577 - Direction Data

**Engine & Propulsion:**
- PGN 127245 - Rudder Position
- PGN 127493 - Transmission Parameters
- PGN 127498 - Engine Configuration Parameters

**GNSS & Positioning:**
- PGN 129539 - GNSS DOPs
- PGN 129540 - GNSS Satellites in View

**Extended AIS Support:**
- PGN 129039 - AIS Class B Position Report
- PGN 129040 - AIS Class B Extended Position Report
- PGN 129798 - AIS SAR Aircraft Position Report
- PGN 129802 - AIS Safety Related Broadcast Message

**Communication & Safety:**
- PGN 129799 - Radio Frequency/Mode/Power
- PGN 129808 - DSC Call Information

**Network & Product Information:**
- PGN 126464 - PGN List
- PGN 126996 - Product Information

**Vessel Systems:**
- PGN 127251 - Rate of Turn
- PGN 127252 - Heave
- PGN 130576 - Small Craft Status

## Credits

### Original Development
This plugin builds upon the excellent foundation created by:
- **[Scott Bender](https://github.com/sbender9)** - Original author and maintainer
- **[Teppo Kurki](https://github.com/tkurki)** - Core contributor and SignalK project lead
- Original project repository: https://github.com/SignalK/signalk-to-nmea2000

### Enhanced Garmin Compatibility (v2.23.0+)
Extended PGN support and Garmin compatibility enhancements by:
- **[NearlCrews](https://github.com/NearlCrews)** - Enhanced Garmin PGN implementation

## Installation

### Option 1: Install from NPM (Recommended)

1. **Through SignalK AppStore (Easiest):**
   - Open your SignalK server web interface (usually http://localhost:3000)
   - Navigate to **Server → AppStore** 
   - Search for "sk-n2k-emitter"
   - Click **Install**

2. **Manual NPM Installation:**
   ```bash
   # Navigate to your SignalK configuration directory
   cd ~/.signalk
   
   # Install the plugin
   npm install sk-n2k-emitter
   
   # Restart SignalK server
   ```

### Option 2: Install from GitHub (Development)

For the latest development version or to contribute:

```bash
# Clone the repository
git clone https://github.com/NearlCrews/sk-n2k-emitter.git
cd sk-n2k-emitter

# Install dependencies
npm install

# Link to SignalK (for development)
npm link

# Navigate to SignalK config directory and link the plugin
cd ~/.signalk
npm link sk-n2k-emitter

# Restart SignalK server
```

**Note:** After installation, the plugin will appear in the **Plugin Config** screen in your SignalK admin interface where it can be configured and enabled.

### Verify Installation

1. Restart your SignalK server
2. Open the SignalK admin interface (http://localhost:3000)
3. Navigate to **Server → Plugin Config**
4. Look for "SignalK to N2K Emitter" in the plugins list
5. Enable and configure the plugin as needed

## Configuration

### NMEA2000 Connection Setup
Requires that toChildProcess be set to nmea2000out for the actisense execute provider:

```json
{
  "id": "actisense",
  "pipeElements": [{
    "type": "providers/execute",
    "options": {
      "command": "actisense-serial /dev/ttyUSB0",
      "toChildProcess": "nmea2000out"
    }
  }]
}
```

or you can configure your N2K connection to use canboatjs in the server admin user interface:
![image](https://user-images.githubusercontent.com/1049678/41557237-ac2e2eea-7345-11e8-8719-bbd18ef832cb.png)

### Plugin Configuration
The plugin provides 51 individual conversion options in the SignalK admin interface, organized alphabetically:

- **AIS** - AIS vessel data transmission
- **ATTITUDE** - Vessel attitude (pitch, roll, yaw)
- **BATTERY** - DC battery status and monitoring
- **BEARING_DISTANCE_MARKS** - Navigation mark calculations
- **COG_SOG** - Course and speed over ground
- **DEPTH** - Water depth measurements
- **ENGINE_PARAMETERS** - Engine monitoring data
- **GPS_LOCATION** - GNSS position information
- **HEADING** - Vessel heading (magnetic and true)
- **NAVIGATION_DATA** - Comprehensive navigation calculations
- **NOTIFICATIONS** - Alert and alarm management
- **ROUTE_WAYPOINT** - Route and waypoint management
- **RUDDER** - Steering and rudder position
- **WIND** - Wind data (apparent, true, ground)
- And 37 additional specialized conversions...

Each conversion can be individually enabled/disabled and configured with custom data sources.

## Garmin Device Compatibility

This enhanced version provides excellent compatibility with Garmin marine electronics including:

- **Chartplotters**: GPSMAP series, ECHOMAP series
- **Multifunction Displays**: All modern Garmin MFDs
- **Autopilots**: GHP series, Reactor series
- **Instruments**: GMI series, GNX series
- **AIS**: AIS 800, AIS 600 series
- **Radar**: GMR series, xHD series

## AIS Transmission Note

If you're using an NGT-1 to transmit AIS, you need to use Actisense [NMEA Reader](https://www.actisense.com/wp-content/uploads/2017/07/Actisense-NMEA-Reader-v1.517-Setup.exe_.zip) software to add the required PGNs (129794, 129038, 129041, 129039, 129040, 129798, 129802) to the transmitted list.

## Development

### Code Quality Standards
This project uses [Biome](https://biomejs.dev) for modern code formatting and linting:

```bash
# Install dependencies
npm install

# Check code quality
npm run check

# Auto-fix formatting issues
npm run format

# Run linter only
npm run lint

# Run comprehensive tests
npm test
```

### Testing
Comprehensive test suite covering all PGN conversions:
- **190+ Test Cases** - Individual tests for each conversion
- **CANboat Integration** - Validates NMEA2000 message format
- **Edge Case Coverage** - Null handling, boundary conditions
- **Production Validation** - Real-world data compatibility

## Architecture

### Modular Design
Each PGN conversion is implemented as a separate module in `conversions/`:
- **Simple Pattern** - Reliable callback-based conversions
- **Embedded Tests** - Each conversion includes validation tests
- **Signal K Integration** - Seamless data path monitoring
- **Error Resilience** - Comprehensive null/undefined handling

### Performance Optimizations
- **Configurable Timeouts** - Optimized for data frequency and importance
- **Selective Data Sources** - Filter by specific device sources
- **Efficient Streaming** - BaconJS reactive data handling
- **Memory Management** - Proper cleanup and subscription management

## Version History

### v1.0.0 (Enhanced Garmin Compatibility)
- Added 24 new PGN conversions for comprehensive Garmin support
- Achieved 92% coverage of essential Garmin-supported PGNs
- Standardized configuration option naming for better UX
- Enhanced code quality with modern JavaScript standards
- Comprehensive test coverage for all new conversions

### v2.22.0 and Earlier
- Original plugin functionality by Scott Bender and contributors
- Core NMEA2000 conversion framework
- Basic PGN support for common marine data
- SignalK server integration

## License

ISC License - See LICENSE file for details

## Contributing

Contributions are welcome! Please:
1. Follow the established code patterns
2. Include comprehensive tests for new conversions
3. Use Biome for code formatting: `npm run format`
4. Ensure all tests pass: `npm test`

## Support

- **Plugin Support**: [Issues and Discussion](https://github.com/NearlCrews/sk-n2k-emitter)
- **SignalK Documentation**: [SignalK.org](https://signalk.org/)
- **Community Forums**: [SignalK Community Discussions](https://github.com/SignalK/signalk-server/discussions)
