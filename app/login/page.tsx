const handleRegisterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const { error } = await supabase.from('umkm').insert([
    {
      nama: regNama,
      tipe_lokasi: regTipe,
      kategori: regKategori,
      dusun: regDusun,
      rt_rw: regRtRw,
      lat: Number(regLat) || 1.0285, // Diset ke number
      lng: Number(regLng) || 104.5486, // Diset ke number
      deskripsi: regDeskripsi || null,
      pin_owner: regPin || '1234',
      alamat_lengkap: regAlamat,
      whatsapp: regWa,
      foto: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
      status_persetujuan: 'pending',
    },
  ]);

  setIsLoading(false);
  if (!error) {
    setMessage({
      type: 'success',
      text: 'Permohonan berhasil dikirim! Admin Desa Toapaya akan me-review data Anda.',
    });
  } else {
    setMessage({
      type: 'error',
      text: `Gagal mengirim permohonan: ${error.message}`,
    });
  }
};