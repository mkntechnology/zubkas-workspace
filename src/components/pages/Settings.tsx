import { useState, useRef, useCallback } from 'react';
import { User, Percent, Palette, Save, Check, Moon, Sun, Building2, Upload, Globe, Phone, Mail, MapPin, FileText, Plus, Trash2, Star, ListPlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings, accentPresets, type AccentKey, type CompanyProfile, type PaymentAccount } from '@/lib/settings';
import { useTheme } from '@/lib/theme';
import { getStoredCredentials, saveCredentials } from '@/lib/auth';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SaveState = 'idle' | 'saving' | 'saved';

function SaveButton({
  onClick,
  label,
  successMessage,
  fullWidth,
}: {
  onClick: () => void | Promise<void>;
  label: string;
  successMessage: string;
  fullWidth?: boolean;
}) {
  const [state, setState] = useState<SaveState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(async () => {
    if (state !== 'idle') return;
    setState('saving');
    try {
      await onClick();
    } catch {
      setState('idle');
      toast.error('Something went wrong. Please try again.');
      return;
    }
    setState('saved');
    toast.success(successMessage, { icon: <Check className="w-4 h-4 text-emerald-500" /> });
    timer.current = setTimeout(() => setState('idle'), 2000);
  }, [state, onClick, successMessage]);

  return (
    <Button
      onClick={handleClick}
      disabled={state !== 'idle'}
      className={cn('gap-2', fullWidth && 'w-full')}
    >
      {state === 'idle' && (<><Save className="w-4 h-4" /> {label}</>)}
      {state === 'saving' && (<><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>)}
      {state === 'saved' && (<><Check className="w-4 h-4 text-emerald-300" /> Saved!</>)}
    </Button>
  );
}

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const { theme, toggle } = useTheme();

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState(getStoredCredentials().email);
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const saveCreds = () => {
    if (!adminEmail) { toast.error('Email is required'); return; }
    if (adminPassword && adminPassword !== confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    const current = getStoredCredentials();
    const newPassword = adminPassword || current.password;
    saveCredentials(adminEmail, newPassword);
    setAdminPassword('');
    setConfirmPassword('');
  };

  // Tax settings
  const [gstRate, setGstRate] = useState(String(settings.gstRate));
  const [cgstRate, setCgstRate] = useState(String(settings.cgstRate));
  const [sgstRate, setSgstRate] = useState(String(settings.sgstRate));
  const [defaultTaxType, setDefaultTaxType] = useState(settings.defaultTaxType);

  const saveTax = () => {
    updateSettings({
      gstRate: Number(gstRate) || 0,
      cgstRate: Number(cgstRate) || 0,
      sgstRate: Number(sgstRate) || 0,
      defaultTaxType,
    });
  };

  // Theme
  const [accent, setAccent] = useState<AccentKey>(settings.accent);
  const [customHex, setCustomHex] = useState(settings.customAccent);

  const saveTheme = () => {
    updateSettings({ accent, customAccent: customHex });
  };

  // Company profile
  const [company, setCompany] = useState<CompanyProfile>(settings.company);

  const updateCompany = (field: keyof CompanyProfile, value: string) => {
    setCompany((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error('Logo too large (max 500KB)'); return; }
    const reader = new FileReader();
    reader.onload = () => updateCompany('logo', reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveCompany = () => {
    updateSettings({ company });
  };

  // Payment accounts
  const [accounts, setAccounts] = useState<PaymentAccount[]>(settings.paymentAccounts);

  const addAccount = () => {
    const newAcc: PaymentAccount = {
      id: `acc-${Date.now()}`,
      label: '',
      accountName: company.name,
      bankName: '',
      accountNumber: '',
      ifsc: '',
      upiId: '',
      isDefault: accounts.length === 0,
    };
    setAccounts([...accounts, newAcc]);
  };

  const updateAccount = (id: string, field: keyof PaymentAccount, value: string | boolean) => {
    setAccounts((prev) => prev.map((a) => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };
        if (field === 'isDefault' && value === true) {
          return { ...updated, isDefault: true };
        }
        return updated;
      }
      if (field === 'isDefault' && value === true) {
        return { ...a, isDefault: false };
      }
      return a;
    }));
  };

  const removeAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const saveAccounts = () => {
    const hasDefault = accounts.some((a) => a.isDefault);
    const finalAccounts = hasDefault ? accounts : accounts.map((a, i) => ({ ...a, isDefault: i === 0 }));
    updateSettings({ paymentAccounts: finalAccounts });
  };

  // Default terms
  const [terms, setTerms] = useState<string[]>(settings.defaultTerms);

  const addTerm = () => setTerms([...terms, '']);
  const updateTerm = (i: number, value: string) => setTerms((prev) => prev.map((t, idx) => idx === i ? value : t));
  const removeTerm = (i: number) => setTerms((prev) => prev.filter((_, idx) => idx !== i));

  const saveTerms = () => {
    const cleaned = terms.filter((t) => t.trim());
    updateSettings({ defaultTerms: cleaned });
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your company profile, payment accounts, tax defaults, and appearance" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Company Profile */}
        <Card className="animate-slide-up lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Building2 className="w-4 h-4" />
              </div>
              Company Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex flex-col items-center gap-2">
                <div className="w-28 h-28 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                  {company.logo ? (
                    <img src={company.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-10 h-10 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </span>
                  </label>
                  {company.logo && (
                    <button onClick={() => updateCompany('logo', '')} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 w-full">
                <Label>Logo URL (optional)</Label>
                <Input value={company.logo} onChange={(e) => updateCompany('logo', e.target.value)} placeholder="Paste image URL or upload above" className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Upload a file or paste a URL. Logo appears on all quotations, invoices, and receipts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={company.name} onChange={(e) => updateCompany('name', e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={company.email} onChange={(e) => updateCompany('email', e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={company.phone} onChange={(e) => updateCompany('phone', e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label>Website</Label>
                <div className="relative mt-1.5">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={company.website} onChange={(e) => updateCompany('website', e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea value={company.address} onChange={(e) => updateCompany('address', e.target.value)} className="pl-10 min-h-[60px]" />
              </div>
            </div>

            <div>
              <Label>GSTIN</Label>
              <Input value={company.gstin} onChange={(e) => updateCompany('gstin', e.target.value)} className="mt-1.5 font-mono" placeholder="27ABCDE1234F1Z5" />
            </div>

            <SaveButton onClick={saveCompany} label="Save Company Profile" successMessage="Company profile updated successfully!" fullWidth />
          </CardContent>
        </Card>

        {/* Payment Accounts */}
        <Card className="animate-slide-up lg:col-span-2" style={{ animationDelay: '30ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-4 h-4" />
              </div>
              Payment Accounts (Bank & UPI)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No payment accounts yet. Add one to display on invoices and quotations.</p>
            )}
            {accounts.map((acc) => (
              <div key={acc.id} className="rounded-lg border border-border p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateAccount(acc.id, 'isDefault', true)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors',
                        acc.isDefault
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border text-muted-foreground hover:bg-muted',
                      )}
                    >
                      <Star className={cn('w-3 h-3', acc.isDefault && 'fill-current')} />
                      {acc.isDefault ? 'Default' : 'Set Default'}
                    </button>
                  </div>
                  <button onClick={() => removeAccount(acc.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Account Label</Label>
                    <Input value={acc.label} onChange={(e) => updateAccount(acc.id, 'label', e.target.value)} placeholder="HDFC Primary" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Account Name</Label>
                    <Input value={acc.accountName} onChange={(e) => updateAccount(acc.id, 'accountName', e.target.value)} placeholder="Zubkas Technology" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Bank Name</Label>
                    <Input value={acc.bankName} onChange={(e) => updateAccount(acc.id, 'bankName', e.target.value)} placeholder="HDFC Bank" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Account Number</Label>
                    <Input value={acc.accountNumber} onChange={(e) => updateAccount(acc.id, 'accountNumber', e.target.value)} placeholder="50200012345678" className="mt-1 font-mono" />
                  </div>
                  <div>
                    <Label className="text-xs">IFSC Code</Label>
                    <Input value={acc.ifsc} onChange={(e) => updateAccount(acc.id, 'ifsc', e.target.value)} placeholder="HDFC0001234" className="mt-1 font-mono" />
                  </div>
                  <div>
                    <Label className="text-xs">UPI ID</Label>
                    <Input value={acc.upiId} onChange={(e) => updateAccount(acc.id, 'upiId', e.target.value)} placeholder="company@upi" className="mt-1" />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addAccount} className="gap-2 w-full"><Plus className="w-4 h-4" /> Add Payment Account</Button>
            {accounts.length > 0 && (
              <SaveButton onClick={saveAccounts} label="Save Payment Accounts" successMessage="Payment accounts saved successfully!" fullWidth />
            )}
          </CardContent>
        </Card>

        {/* Default Terms */}
        <Card className="animate-slide-up lg:col-span-2" style={{ animationDelay: '60ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <ListPlus className="w-4 h-4" />
              </div>
              Default Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">These pre-fill into every new quotation and invoice. You can customize per document in the builder.</p>
            {terms.map((t, i) => (
              <div key={i} className="flex gap-2">
                <Input value={t} onChange={(e) => updateTerm(i, e.target.value)} placeholder={`Term ${i + 1}`} />
                <button onClick={() => removeTerm(i)} className="p-2.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" onClick={addTerm} className="gap-2"><Plus className="w-4 h-4" /> Add Term</Button>
            <SaveButton onClick={saveTerms} label="Save Default Terms" successMessage="Default terms updated successfully!" fullWidth />
          </CardContent>
        </Card>

        {/* Admin Profile */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <User className="w-4 h-4" />
              </div>
              Admin Profile & Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Admin Email</Label>
              <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" className="mt-1.5" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Leave blank to keep current" className="mt-1.5" />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="mt-1.5" />
            </div>
            <SaveButton onClick={saveCreds} label="Save Credentials" successMessage="Admin credentials saved successfully!" fullWidth />
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card className="animate-slide-up" style={{ animationDelay: '60ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Percent className="w-4 h-4" />
              </div>
              Tax Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>GST %</Label>
                <Input type="number" value={gstRate} onChange={(e) => setGstRate(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>CGST %</Label>
                <Input type="number" value={cgstRate} onChange={(e) => setCgstRate(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>SGST %</Label>
                <Input type="number" value={sgstRate} onChange={(e) => setSgstRate(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Default Tax Type</Label>
              <Select value={defaultTaxType} onValueChange={(v) => setDefaultTaxType(v as typeof defaultTaxType)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tax</SelectItem>
                  <SelectItem value="intra">Intra-State (CGST+SGST)</SelectItem>
                  <SelectItem value="inter">Inter-State (IGST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">These rates auto-apply when creating new invoices and quotations.</p>
            <SaveButton onClick={saveTax} label="Save Tax Settings" successMessage="Tax settings saved successfully!" fullWidth />
          </CardContent>
        </Card>

        {/* Theme & Styling */}
        <Card className="animate-slide-up lg:col-span-2" style={{ animationDelay: '120ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Palette className="w-4 h-4" />
              </div>
              Theme & Styling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Appearance Mode</Label>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => theme !== 'light' && toggle()}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all',
                    theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
                  )}
                >
                  <Sun className="w-4 h-4" /> Light
                  {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
                </button>
                <button
                  onClick={() => theme !== 'dark' && toggle()}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all',
                    theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
                  )}
                >
                  <Moon className="w-4 h-4" /> Dark
                  {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
                </button>
              </div>
            </div>

            <div>
              <Label>Accent Color</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {(Object.keys(accentPresets) as Exclude<AccentKey, 'custom'>[]).map((key) => {
                  const preset = accentPresets[key];
                  const active = accent === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setAccent(key); }}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-3 rounded-lg border-2 transition-all',
                        active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
                      )}
                    >
                      <span className="w-6 h-6 rounded-full shrink-0 shadow-md" style={{ backgroundColor: preset.swatch }} />
                      <span className="text-sm font-medium">{preset.label}</span>
                      {active && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex Color Picker */}
            <div>
              <Label>Custom Color</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={accent === 'custom' ? customHex : '#0ea5e9'}
                  onChange={(e) => {
                    setCustomHex(e.target.value);
                    setAccent('custom');
                  }}
                  className="w-12 h-10 rounded-lg border border-border cursor-pointer bg-card p-1"
                />
                <Input
                  value={customHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                      setCustomHex(val);
                      if (val.length === 7) setAccent('custom');
                    }
                  }}
                  placeholder="#6366f1"
                  className="font-mono max-w-[160px]"
                />
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm"
                  style={{ borderColor: customHex, color: customHex }}
                >
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: customHex }} />
                  Preview
                </div>
                {accent === 'custom' && <Check className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Pick any color or enter a hex code. The entire app and PDF accents update instantly.</p>
            </div>

            <SaveButton onClick={saveTheme} label="Apply Theme" successMessage="Theme and styling applied successfully!" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
