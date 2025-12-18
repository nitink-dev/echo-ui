import React, { useEffect, useState } from "react";
import { Activity, Server, Database, RefreshCw, Clock, Wifi, WifiOff, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { useSelector } from "react-redux";
import { fetchHealthStatus } from "../../../store/slices/healthSlice";
import { useAppDispatch } from "../../../hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

export function HealthMonitor() {
  const dispatch = useAppDispatch();
  const { thirdParties, microservices, dependencies, timestamp, loading, lastFetched } = 
    useSelector((s: any) => s.health || {});

  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    dispatch(fetchHealthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      dispatch(fetchHealthStatus());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchHealthStatus());
  };

  const formatTimestamp = (ts: string | null) => {
    if (!ts) return "N/A";
    return new Date(ts).toLocaleString();
  };

  const formatLastFetched = (ts: number | null) => {
    if (!ts) return "Never";
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getStatusColor = (status: string) => {
    return status === "UP" ? "bg-green-500" : "bg-red-500";
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    return status === "UP" ? "default" : "destructive";
  };

  const getStatusText = (status: string) => {
    return status === "UP" ? "Online" : "Offline";
  };

  const ServiceCard = ({ service }: { service: any }) => (
    <div className="flex items-start gap-4 p-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      
    
  
      <div className="flex-1 min-w-0">
        {/* Name + Status + Hover Info Button */}
        <div className="flex items-center justify-between gap-2">
         
          <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} ${
              service.status === "UP" ? "animate-pulse" : ""
            }`}
          />
          
            <h3 className="font-semibold text-gray-900 truncate">
              {service.name}
            </h3>
  
            {/* Hover Info Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                </TooltipTrigger>
  
                <TooltipContent 
                  side="right"
                  className="bg-white border border-gray-200 shadow-xl p-4 rounded-xl text-xs text-gray-700 animate-in fade-in-0 zoom-in-95"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500">URL</p>
                      <p className="font-mono text-[11px] break-all text-gray-900">{service.url}</p>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">HTTP Status:</span>
                      <span className="px-3 font-mono text-gray-800">{service.httpStatus ?? "N/A"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Latency:</span>
                      <span className="font-mono text-gray-800">{service.latencyMs}ms</span>
                    </div>
                  </div>
                </TooltipContent>

              </Tooltip>
            </TooltipProvider>
          </div>
  
          <Badge variant={getStatusBadgeVariant(service.status)} className="shrink-0">
            {getStatusText(service.status)}
          </Badge>
        </div>
  
        {/* Show error only */}
        {service.error && (
          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
            <div className="text-xs font-semibold text-red-800 mb-1">Error:</div>
            <div className="text-xs text-red-700 font-mono break-all">
              {service.error}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const DependencyBadge = ({ name, status }: { name: string; status: string }) => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
      <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)} ${status === 'UP' ? 'animate-pulse' : ''}`} />
      <div className="flex-1">
        <span className="font-medium text-gray-900 capitalize">{name}</span>
      </div>
      <Badge variant={getStatusBadgeVariant(status)} className="text-xs">
        {getStatusText(status)}
      </Badge>
    </div>
  );

  const upCount = (services: any[]) => services?.filter(s => s.status === "UP").length || 0;
  const downCount = (services: any[]) => services?.filter(s => s.status === "DOWN").length || 0;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-7 w-7 text-blue-600" />
              System Health Monitor
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time monitoring of microservices and dependencies
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="text-gray-600">Last Updated</div>
              <div className="font-medium text-gray-900">{formatLastFetched(lastFetched)}</div>
            </div>
            <Button 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Timestamp Card */}
        {timestamp && (
          <Card className="border border-gray-200 shadow-sm mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-700">System Time:</span>
                <span className="text-gray-900">{formatTimestamp(timestamp)}</span>
                
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      autoRefresh 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {autoRefresh ? (
                      <>
                        <Wifi className="h-3.5 w-3.5" />
                        Auto-refresh ON
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3.5 w-3.5" />
                        Auto-refresh OFF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dependencies */}
        {/* {dependencies && (
          <Card className="border border-gray-200 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="h-5 w-5 text-purple-600" />
                Core Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {Object.entries(dependencies).map(([key, status]) => (
                  <DependencyBadge key={key} name={key.charAt(0).toUpperCase() + key.slice(1)} status={status as string} />
                ))}
              </div>
            </CardContent>
          </Card>
        )} */}
        <div className="grid grid-cols-2 xl:grid-cols-2 gap-6 w-full">
          {/* Microservices */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Server className="h-5 w-5 text-blue-600" />
                  Enrichment Tool Services
                  <span className="text-sm font-normal text-gray-600">
                    ({microservices?.length || 0} services)
                  </span>
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="font-medium text-green-700">{upCount(microservices)} Online</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="font-medium text-red-700">{downCount(microservices)} Offline</span>
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-4">
                {microservices?.map((service: any, idx: number) => (
                  <ServiceCard key={idx} service={service} type="microservice" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Integrated Applications
                  <span className="text-sm font-normal text-gray-600">
                    ({thirdParties?.length || 0} services)
                  </span>
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="font-medium text-green-700">{upCount(thirdParties)} Online</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="font-medium text-red-700">{downCount(thirdParties)} Offline</span>
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-4">
                {thirdParties?.map((service: any, idx: number) => (
                  <ServiceCard key={idx} service={service} type="thirdparty" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {loading && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              Fetching health status...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}