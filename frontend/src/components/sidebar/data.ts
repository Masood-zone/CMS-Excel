import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";

export const super_nav = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/admin",
        },
        {
          title: "Administrators",
          url: "/admin/administrators",
        },
        {
          title: "Teachers",
          url: "/admin/teachers",
        },
      ],
    },
    {
      title: "Administartion",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Students",
          url: "/admin/students",
        },
        {
          title: "Classes",
          url: "/admin/classes",
        },
      ],
    },
    {
      title: "Accounting",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Setup Canteen",
          url: "/admin/canteen-records/setup-canteen",
        },
        {
          title: "Canteen Records",
          url: "/admin/canteen-records",
        },
        {
          title: "Owing Records",
          url: "/admin/owings",
        },
        {
          title: "Expenses",
          url: "/admin/expenses",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "General",
          url: "/admin/settings",
        },
      ],
    },
  ],
};

export const teacher_nav = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/teacher",
        },
        {
          title: "View Canteen Records",
          url: "/teacher/canteen/submitted-records",
        },
        {
          title: "Canteen",
          url: "/teacher/canteen",
        },
        {
          title: "Owings",
          url: "/teacher/students/owing-students",
        },
        {
          title: "Students",
          url: "/teacher/students",
        },
      ],
    },
    // To be worked on later
    // {
    //   title: "Accounting",
    //   url: "/teacher",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Daily Payments",
    //       url: "/teacher/accounting/daily-payments",
    //     },
    //     {
    //       title: "Payment History",
    //       url: "/teacher/accounting/payment-history",
    //     },
    //   ],
    // },
    {
      title: "Settings",
      url: "/teacher/settings",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "General",
          url: "/teacher/settings",
        },
      ],
    },
  ],
};
