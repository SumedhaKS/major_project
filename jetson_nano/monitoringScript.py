#!/usr/bin/env python3
"""
Raspberry Pi CPU and Memory Monitor
Monitors system resources and records peak usage
"""

import psutil
import time
import json
import os
from datetime import datetime
import logging

class PiMonitor:
    def __init__(self, log_file="pi_monitor.log", data_file="peak_usage.json", interval=2):
        self.interval = interval
        self.log_file = log_file
        self.data_file = data_file
        self.peak_cpu = 0.0
        self.peak_memory = 0.0
        self.peak_memory_mb = 0.0
        self.start_time = datetime.now()
        
        # Initialize logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Load previous peak data if exists
        self.load_peak_data()

    def get_cpu_usage(self):
        """Get current CPU usage percentage"""
        return psutil.cpu_percent(interval=1)

    def get_memory_usage(self):
        """Get current memory usage"""
        memory = psutil.virtual_memory()
        return {
            'percent': memory.percent,
            'used_mb': memory.used / (1024 * 1024),
            'total_mb': memory.total / (1024 * 1024)
        }

    def get_temperature(self):
        """Get CPU temperature"""
        try:
            temp = psutil.sensors_temperatures()
            if 'cpu_thermal' in temp:
                return temp['cpu_thermal'][0].current
            elif 'coretemp' in temp:
                return temp['coretemp'][0].current
            else:
                return None
        except:
            return None

    def update_peaks(self, cpu_usage, memory_info):
        """Update peak usage values"""
        if cpu_usage > self.peak_cpu:
            self.peak_cpu = cpu_usage
            
        if memory_info['percent'] > self.peak_memory:
            self.peak_memory = memory_info['percent']
            self.peak_memory_mb = memory_info['used_mb']

    def save_peak_data(self):
        """Save peak usage data to JSON file"""
        data = {
            'peak_cpu_percent': round(self.peak_cpu, 2),
            'peak_memory_percent': round(self.peak_memory, 2),
            'peak_memory_mb': round(self.peak_memory_mb, 2),
            'timestamp': datetime.now().isoformat(),
            'monitoring_duration': str(datetime.now() - self.start_time)
        }
        
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=2)

    def load_peak_data(self):
        """Load previous peak usage data"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    self.peak_cpu = data.get('peak_cpu_percent', 0)
                    self.peak_memory = data.get('peak_memory_percent', 0)
                    self.peak_memory_mb = data.get('peak_memory_mb', 0)
                self.logger.info("Loaded previous peak data")
        except Exception as e:
            self.logger.warning(f"Could not load previous data: {e}")

    def display_stats(self, cpu_usage, memory_info, temp):
        """Display current statistics"""
        os.system('clear' if os.name == 'posix' else 'cls')
        
        print("=" * 50)
        print("RASPBERRY PI SYSTEM MONITOR")
        print("=" * 50)
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Duration: {datetime.now() - self.start_time}")
        print("-" * 50)
        
        # Current usage
        print("CURRENT USAGE:")
        print(f"CPU Usage: {cpu_usage:.2f}%")
        print(f"Memory Usage: {memory_info['percent']:.2f}%")
        print(f"Memory Used: {memory_info['used_mb']:.2f} MB / {memory_info['total_mb']:.2f} MB")
        if temp:
            print(f"CPU Temperature: {temp:.1f}°C")
        
        print("-" * 50)
        
        # Peak usage
        print("PEAK USAGE (This Session):")
        print(f"Peak CPU: {self.peak_cpu:.2f}%")
        print(f"Peak Memory: {self.peak_memory:.2f}%")
        print(f"Peak Memory Used: {self.peak_memory_mb:.2f} MB")
        
        print("-" * 50)
        print("Press Ctrl+C to stop monitoring and save data")
        print("=" * 50)

    def run(self):
        """Main monitoring loop"""
        self.logger.info("Starting Raspberry Pi system monitor")
        self.logger.info(f"Monitoring interval: {self.interval} seconds")
        self.logger.info(f"Log file: {self.log_file}")
        self.logger.info(f"Data file: {self.data_file}")
        
        try:
            while True:
                # Get system metrics
                cpu_usage = self.get_cpu_usage()
                memory_info = self.get_memory_usage()
                temp = self.get_temperature()
                
                # Update peak values
                self.update_peaks(cpu_usage, memory_info)
                
                # Display current stats
                self.display_stats(cpu_usage, memory_info, temp)
                
                # Log to file
                self.logger.info(
                    f"CPU: {cpu_usage:.2f}% | "
                    f"Memory: {memory_info['percent']:.2f}% | "
                    f"Used: {memory_info['used_mb']:.2f}MB | "
                    f"Temp: {temp if temp else 'N/A'}°C"
                )
                
                time.sleep(self.interval)
                
        except KeyboardInterrupt:
            self.logger.info("Monitoring stopped by user")
            self.save_peak_data()
            self.logger.info(f"Peak usage data saved to {self.data_file}")
            print(f"\nPeak usage data saved to {self.data_file}")
            print("Goodbye!")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Raspberry Pi System Monitor')
    parser.add_argument('--interval', '-i', type=float, default=2,
                       help='Monitoring interval in seconds (default: 2)')
    parser.add_argument('--log-file', '-l', default='pi_monitor.log',
                       help='Log file name (default: pi_monitor.log)')
    parser.add_argument('--data-file', '-d', default='peak_usage.json',
                       help='Peak data file name (default: peak_usage.json)')
    
    args = parser.parse_args()
    
    monitor = PiMonitor(
        interval=args.interval,
        log_file=args.log_file,
        data_file=args.data_file
    )
    
    monitor.run()

if __name__ == "__main__":
    main()
