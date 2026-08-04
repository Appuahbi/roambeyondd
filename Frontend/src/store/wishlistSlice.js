import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistApi } from '../api/endpoints';

export const fetchWishlistThunk = createAsyncThunk('wishlist/fetch', async () => {
  const res = await wishlistApi.list();
  return res.data || [];
});

export const toggleWishlistThunk = createAsyncThunk(
  'wishlist/toggle',
  async (packageId, { rejectWithValue }) => {
    try {
      const res = await wishlistApi.check(packageId);
      if (res.data?.isInWishlist) {
        await wishlistApi.remove(packageId);
        return { packageId, action: 'removed' };
      } else {
        await wishlistApi.add(packageId);
        return { packageId, action: 'added' };
      }
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false, ids: [] },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchWishlistThunk.pending, (s) => { s.loading = true; })
      .addCase(fetchWishlistThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
        s.ids = a.payload.map((i) => i.tourPackage?._id || i.tourPackage).filter(Boolean);
      })
      .addCase(fetchWishlistThunk.rejected, (s) => { s.loading = false; })
      .addCase(toggleWishlistThunk.fulfilled, (s, a) => {
        const { packageId, action } = a.payload;
        if (action === 'added') {
          s.ids.push(packageId);
        } else {
          s.ids = s.ids.filter((id) => id !== packageId);
          s.items = s.items.filter((i) => (i.tourPackage?._id || i.tourPackage) !== packageId);
        }
      });
  },
});

export default wishlistSlice.reducer;
