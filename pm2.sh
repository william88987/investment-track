#!/bin/bash

# PM2 Management Script for Investment Tracker

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

case "$1" in
  start)
    # Check if client build is present
    if [ ! -d "client/dist" ]; then
        echo "⚠️  Warning: client/dist not found. You might want to build the application first using: npm run build"
    fi
    
    # Check if server build is present
    if [ ! -f "server/dist/index.js" ]; then
        echo "⚠️  Warning: server/dist/index.js not found. You might want to build the application first using: npm run build"
    fi

    echo "🚀 Starting Investment Tracker with PM2..."
    pm2 start ecosystem.config.cjs
    pm2 save
    echo "✅ Application started!"
    ;;
    
  stop)
    echo "🛑 Stopping Investment Tracker..."
    pm2 stop investment-tracker-server
    echo "✅ Application stopped!"
    ;;
    
  restart)
    echo "🔄 Restarting Investment Tracker..."
    pm2 restart investment-tracker-server
    echo "✅ Application restarted!"
    ;;
    
  reload)
    echo "🔄 Reloading Investment Tracker (zero-downtime)..."
    pm2 reload investment-tracker-server
    echo "✅ Application reloaded!"
    ;;
    
  delete)
    echo "🗑️  Removing Investment Tracker from PM2..."
    pm2 delete investment-tracker-server
    pm2 save
    echo "✅ Application removed from PM2!"
    ;;
    
  logs)
    echo "📋 Showing logs (Ctrl+C to exit)..."
    pm2 logs investment-tracker-server
    ;;
    
  status)
    echo "📊 Application Status:"
    pm2 list
    ;;
    
  monit)
    echo "📊 Opening PM2 Monitor (Ctrl+C to exit)..."
    pm2 monit
    ;;
    
  info)
    echo "ℹ️  Application Info:"
    pm2 info investment-tracker-server
    ;;
    
  startup)
    echo "🔧 Setting up PM2 to start on system boot..."
    pm2 startup
    echo ""
    echo "⚠️  Run the command shown above, then run:"
    echo "   ./pm2.sh start"
    echo "   pm2 save"
    ;;
    
  *)
    echo "Investment Tracker - PM2 Management"
    echo ""
    echo "Usage: ./pm2.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start    - Start the application"
    echo "  stop     - Stop the application"
    echo "  restart  - Restart the application"
    echo "  reload   - Reload with zero-downtime"
    echo "  delete   - Remove from PM2"
    echo "  logs     - View application logs"
    echo "  status   - Show application status"
    echo "  monit    - Open PM2 monitor"
    echo "  info     - Show detailed info"
    echo "  startup  - Configure PM2 to start on boot"
    echo ""
    echo "Examples:"
    echo "  ./pm2.sh start"
    echo "  ./pm2.sh logs"
    echo "  ./pm2.sh status"
    ;;
esac
