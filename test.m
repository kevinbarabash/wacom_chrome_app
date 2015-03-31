#import <Cocoa/Cocoa.h>
#include <string.h>

char msg[100];

CGEventRef handleCGEvent(CGEventTapProxy proxy, CGEventType type, CGEventRef eventRef, void *refcon) {
  if (type == kCGEventLeftMouseDown || type == kCGEventMouseMoved || type == kCGEventLeftMouseDragged || type == kCGEventRightMouseDragged) {
    NSEvent *event = [NSEvent eventWithCGEvent:eventRef];

    sprintf(msg, "{\"pressure\":%f,\"x\":%f,\"y\":%f}", event.pressure, event.locationInWindow.x, event.locationInWindow.y);
    unsigned int len = strlen(msg);
    fwrite((char *)&len, sizeof(char), 4, stdout);
    fwrite(msg, sizeof(char), len, stdout);
    fflush(stdout);

    //    printf("pressure = %f, tilt x,y = %f, %f, location = %f, %f\n", event.pressure, event.tilt.x, event.tilt.y, event.locationInWindow.x, event.locationInWindow.y);
  }

  return eventRef;
}

int main(void) {
  CFMachPortRef eventTap = CGEventTapCreate(kCGHIDEventTap, kCGHeadInsertEventTap, kCGEventTapOptionDefault, kCGEventMaskForAllEvents, handleCGEvent, NULL);
  CFRunLoopSourceRef runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, eventTap, 0);
  CFRunLoopAddSource(CFRunLoopGetMain(), runLoopSource, kCFRunLoopCommonModes);
  CGEventTapEnable(eventTap, true);

  [[NSRunLoop currentRunLoop] run];
}

