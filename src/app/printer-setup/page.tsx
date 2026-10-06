'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    Network,
    Printer,
    Server,
    Settings,
    Terminal,
    Wifi,
} from 'lucide-react';

export default function PrinterSetupDocumentation() {
    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Wireless Printing Setup Guide
                </h1>
                <p className="text-gray-600">
                    Complete guide to setting up wireless thermal printing for
                    your hotel
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="setup">Setup Steps</TabsTrigger>
                    <TabsTrigger value="troubleshooting">
                        Troubleshooting
                    </TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="w-5 h-5" />
                                How Wireless Printing Works
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                Since your Orion backend is hosted in the cloud
                                and your thermal printers are on your local
                                hotel network, we need a bridge to connect them.
                                This is done using a{' '}
                                <strong>Print Gateway</strong>.
                            </p>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold mb-2">
                                    Architecture
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Wifi className="w-4 h-4 text-blue-600" />
                                        <span>
                                            Frontend (Browser) → Cloud Backend
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Server className="w-4 h-4 text-blue-600" />
                                        <span>
                                            Cloud Backend → Cloudflare Tunnel
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Network className="w-4 h-4 text-blue-600" />
                                        <span>
                                            Cloudflare Tunnel → Print Gateway
                                            (Local)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Printer className="w-4 h-4 text-blue-600" />
                                        <span>
                                            Print Gateway → Thermal Printer
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Important:</strong> You need a
                                    computer on your hotel network that stays on
                                    24/7 to run the print gateway. This can be
                                    the reception computer or a dedicated mini
                                    PC.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>What You&apos;ll Need</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    <span>
                                        A computer on your hotel network
                                        (Windows, Mac, or Linux)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    <span>
                                        Thermal printer connected to your
                                        network (XPrinter or similar)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    <span>
                                        Printer&apos;s IP address (check printer
                                        settings or router)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    <span>
                                        Node.js installed (version 16 or higher)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    <span>
                                        Cloudflare account (free tier works)
                                    </span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SETUP STEPS TAB */}
                <TabsContent value="setup" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Terminal className="w-5 h-5" />
                                Step 1: Install Node.js
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Download and install Node.js from{' '}
                                <a
                                    href="https://nodejs.org"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    nodejs.org
                                </a>
                            </p>

                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                                <p className="text-gray-400">
                                    # Verify installation
                                </p>
                                <p>node --version</p>
                                <p>npm --version</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Step 2: Download Print Gateway
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Download the print gateway files from your Orion
                                backend repository:
                            </p>

                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                                <p className="text-gray-400">
                                    # Create a folder for the gateway
                                </p>
                                <p>mkdir orion-print-gateway</p>
                                <p>cd orion-print-gateway</p>
                                <p className="mt-2 text-gray-400">
                                    # Copy print-gateway.js and
                                    print-gateway.env.example
                                </p>
                                <p className="text-gray-400">
                                    # from orion-backend folder to this
                                    directory
                                </p>
                            </div>

                            <Alert>
                                <AlertDescription>
                                    Files needed:{' '}
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                        print-gateway.js
                                    </code>{' '}
                                    and{' '}
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                        print-gateway.env.example
                                    </code>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Step 3: Configure Print Gateway
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Install dependencies and configure the gateway:
                            </p>

                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                                <p className="text-gray-400">
                                    # Install required packages
                                </p>
                                <p>npm install express cors dotenv</p>
                                <p className="mt-2 text-gray-400">
                                    # Create configuration file
                                </p>
                                <p>cp print-gateway.env.example .env</p>
                            </div>

                            <p className="font-semibold mt-4">
                                Edit the{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded">
                                    .env
                                </code>{' '}
                                file:
                            </p>

                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-1">
                                <p>GATEWAY_PORT=3001</p>
                                <p>
                                    PRINTER_IP=192.168.1.200{' '}
                                    <span className="text-gray-400">
                                        # Your printer&apos;s IP
                                    </span>
                                </p>
                                <p>
                                    PRINTER_PORT=9100{' '}
                                    <span className="text-gray-400">
                                        # Usually 9100 for thermal printers
                                    </span>
                                </p>
                                <p>
                                    GATEWAY_API_KEY=your-secure-random-key-here
                                </p>
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Finding your printer IP:</strong>{' '}
                                    Check your printer&apos;s network settings
                                    menu or look in your router&apos;s connected
                                    devices list.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="w-5 h-5" />
                                Step 4: Install Cloudflare Tunnel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Install cloudflared to create a secure tunnel:
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <p className="font-semibold mb-2">
                                        Windows:
                                    </p>
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                                        <p className="text-gray-400">
                                            # Download from:
                                        </p>
                                        <p>
                                            https://github.com/cloudflare/cloudflared/releases
                                        </p>
                                        <p className="mt-2 text-gray-400">
                                            # Or use winget:
                                        </p>
                                        <p>
                                            winget install
                                            Cloudflare.cloudflared
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Mac:</p>
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                                        <p>brew install cloudflared</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Linux:</p>
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-1">
                                        <p>
                                            wget
                                            https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
                                        </p>
                                        <p>
                                            sudo mv cloudflared-linux-amd64
                                            /usr/local/bin/cloudflared
                                        </p>
                                        <p>
                                            sudo chmod +x
                                            /usr/local/bin/cloudflared
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="font-semibold mt-4">
                                Login to Cloudflare:
                            </p>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                                <p>cloudflared tunnel login</p>
                            </div>
                            <p className="text-sm text-gray-600">
                                This will open a browser window to authenticate
                                with Cloudflare.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="w-5 h-5" />
                                Step 5: Create and Configure Tunnel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                                <p className="text-gray-400">
                                    # Create a tunnel
                                </p>
                                <p>
                                    cloudflared tunnel create
                                    orion-print-gateway
                                </p>
                                <p className="mt-2 text-gray-400">
                                    # This will create a tunnel ID - save it!
                                </p>
                                <p className="mt-2 text-gray-400">
                                    # Create config file
                                </p>
                                <p>nano ~/.cloudflared/config.yml</p>
                            </div>

                            <p className="font-semibold mt-4">
                                Add this configuration:
                            </p>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-1">
                                <p>tunnel: YOUR_TUNNEL_ID</p>
                                <p>
                                    credentials-file:
                                    /path/to/.cloudflared/YOUR_TUNNEL_ID.json
                                </p>
                                <p className="mt-2">ingress:</p>
                                <p> - hostname: print.yourdomain.com</p>
                                <p> service: http://localhost:3001</p>
                                <p> - service: http_status:404</p>
                            </div>

                            <p className="font-semibold mt-4">
                                Route the tunnel:
                            </p>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                                <p>
                                    cloudflared tunnel route dns
                                    orion-print-gateway print.yourdomain.com
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Step 6: Start Services
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Start both the print gateway and cloudflare
                                tunnel:
                            </p>

                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                                <p className="text-gray-400">
                                    # Terminal 1: Start print gateway
                                </p>
                                <p>node print-gateway.js</p>
                                <p className="mt-2 text-gray-400">
                                    # Terminal 2: Start cloudflare tunnel
                                </p>
                                <p>
                                    cloudflared tunnel run orion-print-gateway
                                </p>
                            </div>

                            <Alert className="bg-green-50 border-green-200">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertDescription>
                                    <strong>Success!</strong> Your print gateway
                                    should now be accessible at
                                    https://print.yourdomain.com
                                </AlertDescription>
                            </Alert>

                            <p className="font-semibold mt-4">
                                Configure Backend Environment:
                            </p>
                            <p className="text-sm text-gray-600">
                                Add these to your Orion backend .env file:
                            </p>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-1">
                                <p>USE_PRINT_GATEWAY=true</p>
                                <p>
                                    PRINT_GATEWAY_URL=https://print.yourdomain.com
                                </p>
                                <p>
                                    PRINT_GATEWAY_API_KEY=your-secure-random-key-here
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Step 7: Run as Service (Optional but
                                Recommended)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                To ensure the services start automatically on
                                boot:
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <p className="font-semibold mb-2">
                                        Using PM2 (Recommended):
                                    </p>
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-1">
                                        <p>npm install -g pm2</p>
                                        <p>
                                            pm2 start print-gateway.js --name
                                            orion-print
                                        </p>
                                        <p>pm2 startup</p>
                                        <p>pm2 save</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">
                                        Cloudflare Tunnel as Service:
                                    </p>
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                                        <p>cloudflared service install</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TROUBLESHOOTING TAB */}
                <TabsContent value="troubleshooting" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Common Issues and Solutions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-2">
                                    ❌ Print gateway not starting
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>
                                        Check if port 3001 is already in use
                                    </li>
                                    <li>
                                        Verify Node.js is installed:{' '}
                                        <code className="bg-gray-100 px-1 rounded">
                                            node --version
                                        </code>
                                    </li>
                                    <li>
                                        Ensure all dependencies are installed:{' '}
                                        <code className="bg-gray-100 px-1 rounded">
                                            npm install
                                        </code>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">
                                    ❌ Cannot connect to printer
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>
                                        Verify printer IP address is correct
                                    </li>
                                    <li>
                                        Check printer is powered on and
                                        connected to network
                                    </li>
                                    <li>
                                        Ping the printer:{' '}
                                        <code className="bg-gray-100 px-1 rounded">
                                            ping 192.168.1.200
                                        </code>
                                    </li>
                                    <li>
                                        Ensure printer port is 9100 (check
                                        printer manual)
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">
                                    ❌ Cloudflare tunnel not working
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>
                                        Check tunnel status:{' '}
                                        <code className="bg-gray-100 px-1 rounded">
                                            cloudflared tunnel info
                                            orion-print-gateway
                                        </code>
                                    </li>
                                    <li>Verify DNS is configured correctly</li>
                                    <li>Check config.yml file syntax</li>
                                    <li>
                                        Restart tunnel:{' '}
                                        <code className="bg-gray-100 px-1 rounded">
                                            cloudflared tunnel run
                                            orion-print-gateway
                                        </code>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">
                                    ❌ Print jobs not reaching printer
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>Check print gateway logs for errors</li>
                                    <li>
                                        Verify backend environment variables are
                                        set correctly
                                    </li>
                                    <li>
                                        Test gateway health:{' '}
                                        <code className="bg-gray-100 px-1 rounded">
                                            curl
                                            https://print.yourdomain.com/health
                                        </code>
                                    </li>
                                    <li>
                                        Ensure API key matches between backend
                                        and gateway
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Testing Your Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                                <p className="text-gray-400">
                                    # Test print gateway health
                                </p>
                                <p>curl http://localhost:3001/health</p>
                                <p className="mt-2 text-gray-400">
                                    # Test via tunnel
                                </p>
                                <p>curl https://print.yourdomain.com/health</p>
                            </div>

                            <p className="text-sm text-gray-600">
                                Expected response:{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded">
                                    {
                                        "{ status: 'ok', defaultPrinter: '192.168.1.200:9100', ... }"
                                    }
                                </code>
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ADVANCED TAB */}
                <TabsContent value="advanced" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Multiple Printers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                You can configure multiple printers in your
                                hotel. Each printer configuration is saved in
                                the database and associated with your hotel.
                            </p>

                            <p className="font-semibold">To add a printer:</p>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                                <li>Go to Admin → Printer Settings</li>
                                <li>Click &apos;Add Printer&apos;</li>
                                <li>Enter printer name, IP, and port</li>
                                <li>Save configuration</li>
                            </ol>

                            <Alert>
                                <AlertDescription>
                                    The print gateway can handle multiple
                                    printers. Just specify the printer IP and
                                    port in each print request.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Security Best Practices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Use a strong, random API key for
                                        GATEWAY_API_KEY
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Keep the .env file secure and never
                                        commit it to version control
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Use HTTPS for the tunnel (Cloudflare
                                        provides this automatically)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Regularly update cloudflared and Node.js
                                    </span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Alternative: VPN Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Instead of Cloudflare Tunnel, you can use a VPN
                                to connect your backend server to your local
                                network:
                            </p>

                            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                                <li>
                                    Set up WireGuard or OpenVPN on your hotel
                                    network
                                </li>
                                <li>Connect your backend server to the VPN</li>
                                <li>
                                    Configure backend to print directly to
                                    printer IP
                                </li>
                                <li>
                                    Set USE_PRINT_GATEWAY=false in backend .env
                                </li>
                            </ul>

                            <Alert>
                                <AlertDescription>
                                    VPN setup requires more technical knowledge
                                    but eliminates the need for the print
                                    gateway service.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
