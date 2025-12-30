import { useEffect, useMemo, useRef } from 'react';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { transform } from 'sucrase';
import { cn } from '@/lib/utils';

interface CodePreviewProps {
  /**
   * NOTE: This prop name is legacy.
   * We pass the generated App.tsx source here (not HTML).
   */
  html: string;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
}

function preprocessAppSource(source: string) {
  return source
    // Strip all import statements (single-line and multi-line)
    .replace(/import\s+[\s\S]*?from\s*['"][^'"]*['"];?/g, '')
    .replace(/import\s*['"][^'"]*['"];?/g, '')
    // Strip named exports
    .replace(/export\s*\{[^}]*\};?/g, '')
    // Convert "export default function Name" to "function App"
    .replace(/export\s+default\s+function\s+\w+/g, 'function App')
    // Convert "export default () =>" or "export default Name" to "const App ="
    .replace(/export\s+default\s+/g, 'const App = ')
    // Remove standalone "export default ComponentName;" at end
    .replace(/^const App = \w+;?\s*$/gm, '');
}

const CodePreview = ({ html: appSource, deviceMode }: CodePreviewProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const runtimeRootRef = useRef<Root | null>(null);

  const compilation = useMemo(() => {
    const processed = preprocessAppSource(appSource ?? '');

    try {
      const js = transform(processed, {
        transforms: ['typescript', 'jsx'],
      }).code;
      return { js, error: null as string | null };
    } catch (e) {
      return {
        js: null as string | null,
        error: e instanceof Error ? e.message : 'Failed to compile preview source',
      };
    }
  }, [appSource]);

  useEffect(() => {
    if (!mountRef.current) return;

    if (!runtimeRootRef.current) {
      runtimeRootRef.current = createRoot(mountRef.current);
    }

    // Always render *something* so the user never sees a blank preview.
    if (!appSource?.trim()) {
      runtimeRootRef.current.render(
        <div className="min-h-full p-6 text-sm text-muted-foreground">
          No <code>App.tsx</code> content yet.
        </div>
      );
      return;
    }

    if (compilation.error || !compilation.js) {
      runtimeRootRef.current.render(
        <div className="min-h-full p-6 text-sm text-destructive">
          Preview compile error: {compilation.error}
        </div>
      );
      return;
    }

    try {
      const factory = new Function(
        'React',
        `"use strict";
         const { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, forwardRef, memo, Fragment } = React;

         // Comprehensive lucide-react icon stubs
         const createIcon = (symbol) => (props) => React.createElement('span', { 
           ...props, 
           style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1em', height: '1em', ...props?.style }
         }, symbol);
         
         const Plus = createIcon('+');
         const Minus = createIcon('−');
         const X = createIcon('✕');
         const Check = createIcon('✓');
         const ChevronRight = createIcon('›');
         const ChevronLeft = createIcon('‹');
         const ChevronUp = createIcon('∧');
         const ChevronDown = createIcon('∨');
         const ArrowRight = createIcon('→');
         const ArrowLeft = createIcon('←');
         const ArrowUp = createIcon('↑');
         const ArrowDown = createIcon('↓');
         const Search = createIcon('🔍');
         const Menu = createIcon('☰');
         const Home = createIcon('⌂');
         const Settings = createIcon('⚙');
         const User = createIcon('👤');
         const Users = createIcon('👥');
         const Mail = createIcon('✉');
         const Phone = createIcon('📞');
         const Calendar = createIcon('📅');
         const Clock = createIcon('🕐');
         const Heart = createIcon('♥');
         const Star = createIcon('★');
         const Edit = createIcon('✎');
         const Trash = createIcon('🗑');
         const Trash2 = createIcon('🗑');
         const Save = createIcon('💾');
         const Download = createIcon('⬇');
         const Upload = createIcon('⬆');
         const File = createIcon('📄');
         const Folder = createIcon('📁');
         const Image = createIcon('🖼');
         const Camera = createIcon('📷');
         const Video = createIcon('🎥');
         const Music = createIcon('🎵');
         const Play = createIcon('▶');
         const Pause = createIcon('⏸');
         const Stop = createIcon('⏹');
         const SkipBack = createIcon('⏮');
         const SkipForward = createIcon('⏭');
         const Volume = createIcon('🔊');
         const Volume2 = createIcon('🔊');
         const VolumeX = createIcon('🔇');
         const Bell = createIcon('🔔');
         const BellOff = createIcon('🔕');
         const Lock = createIcon('🔒');
         const Unlock = createIcon('🔓');
         const Eye = createIcon('👁');
         const EyeOff = createIcon('🚫');
         const Sun = createIcon('☀');
         const Moon = createIcon('🌙');
         const Cloud = createIcon('☁');
         const Loader = createIcon('⟳');
         const Loader2 = createIcon('⟳');
         const RefreshCw = createIcon('↻');
         const RefreshCcw = createIcon('↺');
         const RotateCw = createIcon('↻');
         const RotateCcw = createIcon('↺');
         const Repeat = createIcon('🔁');
         const Shuffle = createIcon('🔀');
         const Copy = createIcon('📋');
         const Clipboard = createIcon('📋');
         const Share = createIcon('↗');
         const Share2 = createIcon('↗');
         const ExternalLink = createIcon('↗');
         const Link = createIcon('🔗');
         const Link2 = createIcon('🔗');
         const Unlink = createIcon('⛓');
         const Globe = createIcon('🌐');
         const Map = createIcon('🗺');
         const MapPin = createIcon('📍');
         const Navigation = createIcon('🧭');
         const Compass = createIcon('🧭');
         const Send = createIcon('➤');
         const MessageCircle = createIcon('💬');
         const MessageSquare = createIcon('💬');
         const AlertCircle = createIcon('⚠');
         const AlertTriangle = createIcon('⚠');
         const Info = createIcon('ℹ');
         const HelpCircle = createIcon('?');
         const XCircle = createIcon('⊗');
         const CheckCircle = createIcon('✓');
         const CheckCircle2 = createIcon('✓');
         const PlusCircle = createIcon('⊕');
         const MinusCircle = createIcon('⊖');
         const Filter = createIcon('⧩');
         const Grid = createIcon('⊞');
         const List = createIcon('☰');
         const MoreHorizontal = createIcon('⋯');
         const MoreVertical = createIcon('⋮');
         const Zap = createIcon('⚡');
         const Activity = createIcon('📈');
         const TrendingUp = createIcon('📈');
         const TrendingDown = createIcon('📉');
         const BarChart = createIcon('📊');
         const BarChart2 = createIcon('📊');
         const PieChart = createIcon('◐');
         const DollarSign = createIcon('$');
         const CreditCard = createIcon('💳');
         const ShoppingCart = createIcon('🛒');
         const ShoppingBag = createIcon('🛍');
         const Package = createIcon('📦');
         const Gift = createIcon('🎁');
         const Tag = createIcon('🏷');
         const Bookmark = createIcon('🔖');
         const Award = createIcon('🏆');
         const Target = createIcon('🎯');
         const Crosshair = createIcon('⊕');
         const Terminal = createIcon('>_');
         const Code = createIcon('</>');
         const Code2 = createIcon('</>');
         const Database = createIcon('🗄');
         const Server = createIcon('🖥');
         const Cpu = createIcon('⬡');
         const Wifi = createIcon('📶');
         const WifiOff = createIcon('📵');
         const Bluetooth = createIcon('ᛒ');
         const Battery = createIcon('🔋');
         const Power = createIcon('⏻');
         const LogIn = createIcon('→');
         const LogOut = createIcon('←');
         const Key = createIcon('🔑');
         const Shield = createIcon('🛡');
         const Fingerprint = createIcon('👆');
         const Layers = createIcon('☷');
         const Layout = createIcon('⊞');
         const Sidebar = createIcon('▐');
         const PanelLeft = createIcon('◧');
         const PanelRight = createIcon('◨');
         const Maximize = createIcon('⤢');
         const Minimize = createIcon('⤡');
         const Maximize2 = createIcon('⤢');
         const Minimize2 = createIcon('⤡');
         const Move = createIcon('✥');
         const GripVertical = createIcon('⋮');
         const GripHorizontal = createIcon('⋯');
         const Pencil = createIcon('✏');
         const Eraser = createIcon('⌫');
         const Highlighter = createIcon('🖌');
         const Type = createIcon('T');
         const Bold = createIcon('B');
         const Italic = createIcon('I');
         const Underline = createIcon('U');
         const AlignLeft = createIcon('≡');
         const AlignCenter = createIcon('≡');
         const AlignRight = createIcon('≡');
         const AlignJustify = createIcon('≡');
         const ListOrdered = createIcon('1.');
         const ToggleLeft = createIcon('○—');
         const ToggleRight = createIcon('—●');
         const Circle = createIcon('○');
         const Square = createIcon('□');
         const Triangle = createIcon('△');
         const Hexagon = createIcon('⬡');
         const Sparkles = createIcon('✨');
         const Flame = createIcon('🔥');
         const Snowflake = createIcon('❄');
         const Umbrella = createIcon('☂');
         const Wind = createIcon('💨');
         const Droplet = createIcon('💧');
         const Thermometer = createIcon('🌡');
         const ThumbsUp = createIcon('👍');
         const ThumbsDown = createIcon('👎');
         const Smile = createIcon('😊');
         const Frown = createIcon('☹');
         const Meh = createIcon('😐');
         const PartyPopper = createIcon('🎉');
         const Rocket = createIcon('🚀');
         const Lightbulb = createIcon('💡');
         const Book = createIcon('📖');
         const BookOpen = createIcon('📖');
         const GraduationCap = createIcon('🎓');
         const Briefcase = createIcon('💼');
         const Building = createIcon('🏢');
         const Building2 = createIcon('🏢');
         const Car = createIcon('🚗');
         const Plane = createIcon('✈');
         const Train = createIcon('🚆');
         const Bike = createIcon('🚲');
         const Ship = createIcon('🚢');
         const Anchor = createIcon('⚓');
         const Mountain = createIcon('⛰');
         const TreePine = createIcon('🌲');
         const Flower = createIcon('🌸');
         const Leaf = createIcon('🍃');
         const Bug = createIcon('🐛');
         const Cat = createIcon('🐱');
         const Dog = createIcon('🐕');
         const Fish = createIcon('🐟');
         const Bird = createIcon('🐦');
         const Feather = createIcon('🪶');
         const Scissors = createIcon('✂');
         const Wrench = createIcon('🔧');
         const Hammer = createIcon('🔨');
         const Axe = createIcon('🪓');
         const Ruler = createIcon('📏');
         const Glasses = createIcon('👓');
         const Watch = createIcon('⌚');
         const Headphones = createIcon('🎧');
         const Speaker = createIcon('🔈');
         const Mic = createIcon('🎤');
         const MicOff = createIcon('🚫');
         const Radio = createIcon('📻');
         const Tv = createIcon('📺');
         const Monitor = createIcon('🖥');
         const Laptop = createIcon('💻');
         const Tablet = createIcon('📱');
         const Smartphone = createIcon('📱');
         const Printer = createIcon('🖨');
         const Keyboard = createIcon('⌨');
         const Mouse = createIcon('🖱');
         const Usb = createIcon('⌁');
         const HardDrive = createIcon('💾');
         const Disc = createIcon('💿');
         const ScanLine = createIcon('▤');
         const QrCode = createIcon('⊞');
         const Barcode = createIcon('|||');
         const Receipt = createIcon('🧾');
         const Wallet = createIcon('👛');
         const Banknote = createIcon('💵');
         const Coins = createIcon('🪙');
         const Gem = createIcon('💎');
         const Crown = createIcon('👑');
         const Medal = createIcon('🏅');
         const Trophy = createIcon('🏆');
         const Flag = createIcon('🚩');
         const Pin = createIcon('📌');
         const Paperclip = createIcon('📎');
         const AtSign = createIcon('@');
         const Hash = createIcon('#');
         const Percent = createIcon('%');
         const Infinity = createIcon('∞');
         const Equal = createIcon('=');
         const NotEqual = createIcon('≠');
         const MoreHorizontal2 = createIcon('⋯');
         const Slash = createIcon('/');
         const Command = createIcon('⌘');
         const Option = createIcon('⌥');
         const Delete = createIcon('⌫');
         const CornerDownLeft = createIcon('↵');
         const CornerDownRight = createIcon('↳');
         const CornerUpLeft = createIcon('↰');
         const CornerUpRight = createIcon('↱');
         const Undo = createIcon('↶');
         const Redo = createIcon('↷');
         const Undo2 = createIcon('↶');
         const Redo2 = createIcon('↷');
         const History = createIcon('⧖');
         const Timer = createIcon('⏱');
         const TimerOff = createIcon('⏱');
         const Hourglass = createIcon('⏳');
         const Alarm = createIcon('⏰');
         const AlarmClock = createIcon('⏰');
         const CalendarDays = createIcon('📅');
         const CalendarCheck = createIcon('📅');
         const CalendarPlus = createIcon('📅');
         const CalendarMinus = createIcon('📅');
         const CalendarX = createIcon('📅');

         ${compilation.js}

         return typeof App !== 'undefined' ? App : null;`
      );

      const AppComponent = factory(React);

      if (!AppComponent) {
        runtimeRootRef.current.render(
          <div className="min-h-full p-6 text-sm text-muted-foreground">
            No <code>App</code> component found.
          </div>
        );
        return;
      }

      runtimeRootRef.current.render(React.createElement(AppComponent));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown runtime error';
      runtimeRootRef.current.render(
        <div className="min-h-full p-6 text-sm text-destructive">
          Preview runtime error: {message}
        </div>
      );
    }
  }, [appSource, compilation.error, compilation.js]);

  useEffect(() => {
    return () => {
      runtimeRootRef.current?.unmount();
      runtimeRootRef.current = null;
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div
        className={cn(
          'bg-card border border-border rounded-lg shadow-xl transition-all duration-300 overflow-hidden',
          deviceMode === 'desktop' && 'w-full h-full',
          deviceMode === 'tablet' && 'w-[768px] h-[1024px] max-h-full',
          deviceMode === 'mobile' && 'w-[375px] h-[667px]'
        )}
      >
        <div className="w-full h-full bg-background">
          <div ref={mountRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default CodePreview;
