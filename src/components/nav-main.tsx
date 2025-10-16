"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  isCollapsed = false,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  isCollapsed?: boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-white/90 font-semibold tracking-wide">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu
        className={`${isCollapsed ? "mt-12 space-y-4" : "space-y-2"}`}
      >
        {items.map((item) => (
          <SidebarMenuItem key={item.title} className="px-2">
            {item.items && item.items.length > 0 ? (
              <Collapsible
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="text-zinc-100 hover:text-zinc-100 hover:bg-emerald-800/50 transition-all duration-200 py-3 px-4"
                    >
                      {item.icon && <item.icon className="text-white" />}
                      <span className="text-white">{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-white" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className="text-white/80 hover:text-white hover:bg-emerald-700/30 transition-all duration-200"
                          >
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ) : (
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="text-white hover:text-white hover:bg-emerald-800/50 transition-all duration-200 py-3 px-4"
              >
                <a href={item.url}>
                  {item.icon && <item.icon className="text-white" />}
                  <span className="text-white">{item.title}</span>
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
