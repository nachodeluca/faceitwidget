import {
  Check,
  Copy,
  MessageSquare,
  RotateCcw,
} from "lucide-react"

import {
  getEditableFields,
  getRotationFields,
  WIDGET_PRESETS,
  type WidgetConfig,
  type WidgetBackdropConfig,
  type WidgetData,
  type WidgetPresetId,
  type WidgetRotationField,
  type WidgetStyle,
  type WidgetVisibilityKey,
} from "@/lib/widget"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { BackdropControl } from "./background"

const controlLabelClass = "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
const sectionHeadingClass = "text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/80"
const fieldLabelClass = "text-[12px] font-medium text-muted-foreground"
const fieldRowClass = "flex items-center justify-between gap-2 rounded-md border border-transparent px-2 py-2 text-xs text-muted-foreground transition-[border-color,background-color,color] duration-150 ease-[var(--ease-out)] hover:border-border hover:bg-surface-2 hover:text-foreground"

const visibilityLabels: Array<[WidgetVisibilityKey, string]> = [
  ["nickname", "Nickname"],
  ["level", "Level"],
  ["elo", "ELO"],
  ["worldRank", "World rank"],
  ["countryRank", "Country rank"],
  ["challenger", "Challenger"],
  ["challengerRank", "Rank number"],
  ["kdr", "K/D"],
  ["todayStats", "Today stats"],
  ["last30Stats", "Last 30"],
  ["last5Results", "Last 5 results"],
]

const rotationFields: Array<[WidgetRotationField, string]> = [
  ["today", "Today"],
  ["last30", "Last 30"],
  ["lifetime", "Performance"],
]

const styleColors = [
  ["accent", "Accent"],
  ["surface", "Surface"],
  ["text", "Text"],
  ["mutedText", "Muted"],
] as const

type VisibilityGroup = "Player" | "Rank" | "Stats"

const visibilityGroupOrder: VisibilityGroup[] = ["Player", "Rank", "Stats"]
const visibilityGroupByKey: Partial<Record<WidgetVisibilityKey, VisibilityGroup>> = {
  nickname: "Player",
  level: "Player",
  elo: "Rank",
  worldRank: "Rank",
  countryRank: "Rank",
  challenger: "Rank",
  challengerRank: "Rank",
  kdr: "Stats",
  todayStats: "Stats",
  last30Stats: "Stats",
  last5Results: "Stats",
}

function firstSliderValue(value: number | readonly number[]) {
  return typeof value === "number" ? value : value[0]
}

function SettingsSectionHeading({ label, detail }: { label: string; detail?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={sectionHeadingClass}>{label}</span>
      {detail ? <span className="text-[11px] tabular-nums text-muted-foreground">{detail}</span> : null}
    </div>
  )
}

function FieldSwitch({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  ariaLabel,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  ariaLabel: string
}) {
  return (
    <label className={fieldRowClass}>
      <span>{label}</span>
      <Switch
        size="sm"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={ariaLabel}
      />
    </label>
  )
}

type ContentTabProps = {
  config: WidgetConfig
  rank?: WidgetData["rank"]
  onPresetChange: (preset: WidgetPresetId) => void
  onVisibilityChange: (key: WidgetVisibilityKey, value: boolean) => void
}

function ContentTab({ config, rank, onPresetChange, onVisibilityChange }: ContentTabProps) {
  const editableFields = getEditableFields(config.preset, rank)
  const fields = visibilityLabels.filter(([key]) => editableFields.includes(key))
  const activeCount = fields.filter(([key]) => config.visibility[key]).length
  const groupedFields = visibilityGroupOrder
    .map((group) => ({
      group,
      fields: fields.filter(([key]) => visibilityGroupByKey[key] === group),
    }))
    .filter(({ fields: groupFields }) => groupFields.length > 0)

  return (
    <TabsContent value="content" className="mt-4">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <SettingsSectionHeading label="Preset" />
          <Select
            items={WIDGET_PRESETS.map((preset) => ({ value: preset.id, label: preset.label }))}
            value={config.preset}
            onValueChange={(value) => {
              if (value) onPresetChange(value as WidgetPresetId)
            }}
          >
            <SelectTrigger className="h-10 w-full rounded-lg px-3 font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WIDGET_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
          <SettingsSectionHeading label="Visible fields" detail={`${activeCount} active`} />
          <div className="flex flex-col gap-4">
            {groupedFields.map(({ group, fields: groupFields }) => (
              <div className="flex flex-col gap-2" key={group}>
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
                  {group}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {groupFields.map(([key, label]) => (
                    <FieldSwitch
                      key={key}
                      label={label}
                      checked={config.visibility[key] ?? false}
                      onCheckedChange={(checked) => onVisibilityChange(key, checked)}
                      ariaLabel={`Show ${label}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

type StyleTabProps = {
  config: WidgetConfig
  onStyleChange: (patch: Partial<WidgetStyle>) => void
}

type StyleChangeProps = {
  onChange: StyleTabProps["onStyleChange"]
}

type StyleControlsProps = Pick<StyleTabProps, "config" | "onStyleChange">

function SurfaceFillControl({
  value,
  onChange,
}: StyleChangeProps & { value: WidgetConfig["style"]["background"] }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className={fieldLabelClass}>Surface fill</Label>
      <Select
        items={[
          { value: "solid", label: "Solid" },
          { value: "none", label: "Transparent" },
        ]}
        value={value}
        onValueChange={(nextValue) => onChange({ background: nextValue === "none" ? "none" : "solid" })}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="solid">Solid</SelectItem>
          <SelectItem value="none">Transparent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function BorderControl({
  enabled,
  onChange,
}: StyleChangeProps & { enabled: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-2.5 py-2.5 text-xs text-muted-foreground">
      <span className="text-foreground">Border</span>
      <Switch size="sm" checked={enabled} onCheckedChange={(borderEnabled) => onChange({ borderEnabled })} aria-label="Show widget border" />
    </label>
  )
}

function FontControl({
  value,
  onChange,
}: StyleChangeProps & { value: WidgetConfig["style"]["font"] }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className={fieldLabelClass}>Font</Label>
      <Select
        items={[
          { value: "outfit", label: "Outfit" },
          { value: "system", label: "System sans" },
          { value: "mono", label: "Monospace" },
        ]}
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue === "outfit" || nextValue === "system" || nextValue === "mono") {
            onChange({ font: nextValue })
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="outfit">Outfit</SelectItem>
          <SelectItem value="system">System sans</SelectItem>
          <SelectItem value="mono">Monospace</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function StyleRanges({ config, onStyleChange }: StyleControlsProps) {
  return (
    <>
      <RangeControl
        label="Scale"
        value={`${config.style.scale.toFixed(2)}x`}
        min={0.65}
        max={1.5}
        step={0.05}
        sliderValue={config.style.scale}
        onValueChange={(value) => onStyleChange({ scale: value })}
        ariaLabel="Widget scale"
      />
      <RangeControl
        label="Radius"
        value={`${Math.round(config.style.radius)}px`}
        min={0}
        max={20}
        step={1}
        sliderValue={config.style.radius}
        onValueChange={(value) => onStyleChange({ radius: value })}
        ariaLabel="Widget radius"
      />
    </>
  )
}

function ColorControls({ config, onStyleChange }: StyleControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {styleColors.map(([key, label]) => (
        <label
          className="relative flex h-11 items-center gap-2 overflow-hidden rounded-md border border-border/70 bg-surface/30 px-2 transition-[border-color,background-color] duration-150 ease-[var(--ease-out)] hover:border-foreground/35 hover:bg-surface-2"
          htmlFor={`color-${key}`}
          key={key}
        >
          <span
            aria-hidden="true"
            className="size-6 shrink-0 rounded-sm border border-white/15 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_20%)]"
            style={{ backgroundColor: config.style[key] }}
          />
          <span className="min-w-0 truncate text-xs font-medium text-foreground">{label}</span>
          <code className="ml-auto text-[9px] uppercase tabular-nums text-muted-foreground">{config.style[key]}</code>
          <Input
            id={`color-${key}`}
            type="color"
            aria-label={`Change ${label} color`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            value={config.style[key]}
            onChange={(event) => onStyleChange({ [key]: event.target.value })}
          />
        </label>
      ))}
    </div>
  )
}

function StyleTab({ config, onStyleChange }: StyleTabProps) {
  return (
    <TabsContent value="style" className="mt-4 pb-5">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <SettingsSectionHeading label="Surface" />
          <SurfaceFillControl value={config.style.background} onChange={onStyleChange} />
          <BorderControl enabled={config.style.borderEnabled} onChange={onStyleChange} />
        </section>
        <section className="flex flex-col gap-3 border-t border-border/70 pt-5">
          <SettingsSectionHeading label="Type" />
          <FontControl value={config.style.font} onChange={onStyleChange} />
          <StyleRanges config={config} onStyleChange={onStyleChange} />
        </section>
        <section className="flex flex-col gap-3 border-t border-border/70 pt-5">
          <SettingsSectionHeading label="Colors" />
          <ColorControls config={config} onStyleChange={onStyleChange} />
        </section>
      </div>
    </TabsContent>
  )
}

function BackgroundsTab({ config, onBackdropChange }: {
  config: WidgetConfig
  onBackdropChange: (patch: Partial<WidgetBackdropConfig>) => void
}) {
  return (
    <TabsContent value="backgrounds" className="mt-4 pb-5">
      <BackdropControl value={config.backdrop} onChange={onBackdropChange} />
    </TabsContent>
  )
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  sliderValue,
  onValueChange,
  ariaLabel,
}: {
  label: string
  value: string
  min: number
  max: number
  step: number
  sliderValue: number
  onValueChange: (value: number) => void
  ariaLabel: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <Label className={fieldLabelClass}>{label}</Label>
        <span className="text-[12px] tabular-nums text-muted-foreground">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[sliderValue]}
        onValueChange={(nextValue) => onValueChange(firstSliderValue(nextValue))}
        aria-label={ariaLabel}
      />
    </div>
  )
}

type MotionTabProps = {
  config: WidgetConfig
  onRotationChange: (patch: Partial<WidgetConfig["rotation"]>) => void
}

function RotationToggle({ config, onRotationChange }: MotionTabProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-2.5 py-2.5 text-xs text-muted-foreground">
      <span>
        <strong className="block text-sm text-foreground">Auto rotate</strong>
        <small className="mt-1 block text-xs leading-4 text-muted-foreground">Cycle through selected stats.</small>
      </span>
      <Switch
        checked={config.rotation.enabled}
        onCheckedChange={(enabled) => onRotationChange({ enabled })}
        aria-label="Rotate content"
      />
    </label>
  )
}

function RotationFields({ config, onRotationChange }: MotionTabProps) {
  const availableFields = getRotationFields(config.preset)
  const selectedCount = config.rotation.fields.filter((field) => availableFields.includes(field)).length

  return (
    <div className="flex flex-col gap-3">
      <SettingsSectionHeading label="Fields" detail={`${selectedCount} selected`} />
      <div className="grid grid-cols-2 gap-1.5">
        {rotationFields.filter(([field]) => availableFields.includes(field)).map(([field, label]) => (
          <FieldSwitch
            key={field}
            label={label}
            checked={config.rotation.fields.includes(field)}
            onCheckedChange={(checked) => {
              const fields = checked
                ? [...config.rotation.fields, field]
                : config.rotation.fields.filter((current) => current !== field)
              onRotationChange({ fields })
            }}
            disabled={!config.rotation.enabled}
            ariaLabel={`Rotate ${label}`}
          />
        ))}
      </div>
    </div>
  )
}

function MotionTab({ config, onRotationChange }: MotionTabProps) {
  return (
    <TabsContent value="motion" className="mt-4">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4">
          <SettingsSectionHeading label="Rotation" />
          <RotationToggle config={config} onRotationChange={onRotationChange} />
          <RangeControl
            label="Interval"
            value={`${(config.rotation.intervalMs / 1000).toFixed(1)}s`}
            min={1800}
            max={12000}
            step={200}
            sliderValue={config.rotation.intervalMs}
            onValueChange={(intervalMs) => onRotationChange({ intervalMs })}
            ariaLabel="Rotation interval"
          />
        </section>
        <section className="flex flex-col gap-3 border-t border-border/70 pt-5">
          <RotationFields config={config} onRotationChange={onRotationChange} />
        </section>
      </div>
    </TabsContent>
  )
}

type BuilderSidebarProps = {
  config: WidgetConfig
  nickname: string
  rank?: WidgetData["rank"]
  rotationAvailable: boolean
  copied: boolean
  canCopy: boolean
  resetAnimationKey: number
  onNicknameChange: (nickname: string) => void
  onPresetChange: (preset: WidgetPresetId) => void
  onVisibilityChange: (key: WidgetVisibilityKey, value: boolean) => void
  onStyleChange: (patch: Partial<WidgetStyle>) => void
  onBackdropChange: (patch: Partial<WidgetBackdropConfig>) => void
  onRotationChange: (patch: Partial<WidgetConfig["rotation"]>) => void
  onReset: () => void
  onCopy: () => void
  onFeedback: () => void
}

function SidebarPlayer({ nickname, onNicknameChange }: Pick<BuilderSidebarProps, "nickname" | "onNicknameChange">) {
  return (
    <div className="mt-8 flex flex-col gap-2">
      <Label className={controlLabelClass} htmlFor="nickname">
        FACEIT Nickname
      </Label>
      <Input
        id="nickname"
        value={nickname}
        placeholder="player"
        className="focus-visible:border-input focus-visible:ring-0"
        onChange={(event) => onNicknameChange(event.target.value)}
      />
    </div>
  )
}

function SidebarTabs({
  config,
  rank,
  rotationAvailable,
  onPresetChange,
  onVisibilityChange,
  onStyleChange,
  onBackdropChange,
  onRotationChange,
}: Pick<BuilderSidebarProps, "config" | "rank" | "rotationAvailable" | "onPresetChange" | "onVisibilityChange" | "onStyleChange" | "onBackdropChange" | "onRotationChange">) {
  return (
    <Tabs key={config.preset} className="mt-6" defaultValue="content">
      <TabsList className="w-full justify-between p-0" variant="line">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="style">Style</TabsTrigger>
        {rotationAvailable ? <TabsTrigger value="motion">Motion</TabsTrigger> : null}
        <TabsTrigger value="backgrounds">
          <span>Backgrounds</span>
          <Badge
            variant="secondary"
            className="h-4 rounded-full px-1.5 text-[9px] font-bold uppercase tracking-[0.08em]"
          >
            New
          </Badge>
        </TabsTrigger>
      </TabsList>

      <ContentTab
        config={config}
        rank={rank}
        onPresetChange={onPresetChange}
        onVisibilityChange={onVisibilityChange}
      />
      <StyleTab config={config} onStyleChange={onStyleChange} />
      {rotationAvailable ? <MotionTab config={config} onRotationChange={onRotationChange} /> : null}
      <BackgroundsTab config={config} onBackdropChange={onBackdropChange} />
    </Tabs>
  )
}

function SidebarActions({
  copied,
  canCopy,
  resetAnimationKey,
  onReset,
  onCopy,
  onFeedback,
}: Pick<BuilderSidebarProps, "copied" | "canCopy" | "resetAnimationKey" | "onReset" | "onCopy" | "onFeedback">) {
  return (
    <div className="mt-auto border-t border-border/70 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Actions</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                icon={<RotateCcw key={resetAnimationKey} className={cn(resetAnimationKey > 0 && "animate-[spin_500ms_ease-out]")} />}
                onClick={onReset}
                aria-label="Reset widget"
                className="text-muted-foreground hover:text-foreground"
              />
            }
          />
          <TooltipContent>Reset widget</TooltipContent>
        </Tooltip>
      </div>
      <Button
        className="h-10 w-full justify-center rounded-lg font-semibold shadow-[0_1px_0_rgb(0_0_0_/_18%)]"
        size="default"
        icon={copied ? <Check className="text-emerald-500" /> : <Copy />}
        iconPosition="end"
        onClick={onCopy}
        disabled={!canCopy}
        title={canCopy ? "Copy widget URL" : "Waiting for the FACEIT profile"}
      >
        {copied ? "Copied" : "Copy URL"}
      </Button>
      <Button
        className="mt-2 w-full justify-center text-muted-foreground hover:text-foreground"
        variant="ghost"
        size="sm"
        icon={<MessageSquare />}
        onClick={onFeedback}
      >
        Share your feedback
      </Button>
    </div>
  )
}

export function BuilderSidebar({
  config,
  nickname,
  rank,
  rotationAvailable,
  copied,
  canCopy,
  resetAnimationKey,
  onNicknameChange,
  onPresetChange,
  onVisibilityChange,
  onStyleChange,
  onBackdropChange,
  onRotationChange,
  onReset,
  onCopy,
  onFeedback,
}: BuilderSidebarProps) {
  return (
    <aside className="scrollbar-hidden border-b border-border/70 bg-surface/55 lg:sticky lg:top-0 lg:h-screen lg:w-[360px] lg:shrink-0 lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r">
      <div className="flex min-h-full flex-col px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-on-surface">Settings</h1>
          <p className="mt-2 text-body-sm text-tertiary">Configure the widget as you like!</p>
        </header>
        <SidebarPlayer nickname={nickname} onNicknameChange={onNicknameChange} />
        <SidebarTabs
          config={config}
          rank={rank}
          rotationAvailable={rotationAvailable}
          onPresetChange={onPresetChange}
          onVisibilityChange={onVisibilityChange}
          onStyleChange={onStyleChange}
          onBackdropChange={onBackdropChange}
          onRotationChange={onRotationChange}
        />
        <SidebarActions
          copied={copied}
          canCopy={canCopy}
          resetAnimationKey={resetAnimationKey}
          onReset={onReset}
          onCopy={onCopy}
          onFeedback={onFeedback}
        />
      </div>
    </aside>
  )
}
