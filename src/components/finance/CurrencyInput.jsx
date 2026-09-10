// Input nominal Rupiah dengan pemisah ribuan otomatis saat mengetik (mis. 7.175.000),
// sementara value yang dikirim ke parent tetap angka murni (string digit) agar
// gampang di-convert ke Number saat submit.
export default function CurrencyInput({ value, onChange, placeholder = '0', required, id }) {
  const formatted = value === '' || value === null || value === undefined ? '' : Number(value).toLocaleString('id-ID');

  const handleChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    // buang leading zero berlebih (kecuali angka itu sendiri "0")
    const normalized = digitsOnly.replace(/^0+(?=\d)/, '');
    onChange(normalized);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-inkSoft pointer-events-none select-none">Rp</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
        value={formatted}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ paddingLeft: '2.25rem' }}
      />
    </div>
  );
}
