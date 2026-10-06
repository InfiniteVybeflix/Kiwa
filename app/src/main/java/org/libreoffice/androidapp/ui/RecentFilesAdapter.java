/* -*- tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.libreoffice.androidapp.ui;

import android.app.Activity;
import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.pdf.PdfRenderer;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import android.util.LruCache;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import org.libreoffice.androidapp.R;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

class RecentFilesAdapter extends RecyclerView.Adapter<RecentFilesAdapter.ViewHolder> {

    private final long KB = 1024;
    private final long MB = 1048576;

    private LibreOfficeUIActivity mActivity;
    private ArrayList<RecentFile> recentFiles;
    // Process-wide thumbnail cache so we don't re-render the same PDF
    // every time the user navigates between grids.
    private static final LruCache<String, Bitmap> sThumbCache = new LruCache<>(16 * 1024 * 1024);

    RecentFilesAdapter(LibreOfficeUIActivity activity, List<Uri> recentUris) {
        this.mActivity = activity;
        initRecentFiles(recentUris);
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View item = LayoutInflater.from(parent.getContext()).inflate(mActivity.isViewModeList() ? R.layout.file_list_item : R.layout.file_explorer_grid_item, parent, false);
        return new ViewHolder(item);
    }

    /** Validate uris in case of removed/renamed documents and return RecentFile ArrayList from the valid uris */
    public void initRecentFiles(List<Uri> recentUris) {
        this.recentFiles = new ArrayList<>();
        boolean invalidUriFound = false;
        String joined = "";
        for (Uri u: recentUris) {
            String filename = getUriFilename(mActivity, u);
            if (null != filename) {
                long length = getUriFileLength(mActivity, u);
                recentFiles.add(new RecentFile(u, filename, length));
                joined = joined.concat(u.toString()+"\n");
            }
            else
                invalidUriFound = true;
        }
        if (invalidUriFound) {
            mActivity.getPrefs().edit().putString(mActivity.RECENT_DOCUMENTS_KEY, joined).apply();
        }
    }

    /** Return the filename of the given Uri. */
    public static String getUriFilename(Activity activity, Uri uri) {
        String filename = "";
        Cursor cursor = null;
        try {
            cursor = activity.getContentResolver().query(uri, null, null, null, null);
            if (cursor != null && cursor.moveToFirst())
                filename = cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME));
        } catch (Exception e) {
            return null;
        } finally {
            if (cursor != null)
                cursor.close();
        }

        if (filename.isEmpty())
            return null;

        return filename;
    }

    /** Return the size of the given Uri. */
    public static long getUriFileLength(Activity activity, Uri uri) {
        long length = 0;
        Cursor cursor = null;
        try {
            cursor = activity.getContentResolver().query(uri, null, null, null, null);
            if (cursor != null && cursor.moveToFirst())
                length = cursor.getLong(cursor.getColumnIndexOrThrow(OpenableColumns.SIZE));
        } catch (Exception e) {
            return 0;
        } finally {
            if (cursor != null)
                cursor.close();
        }

        if (length == 0) {
            // TODO maybe try to get File & return File.length()?
        }

        return length;
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        final RecentFile file = recentFiles.get(position);

        View.OnClickListener clickListener = new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mActivity.open(file.uri);

            }
        };

        holder.filenameView.setOnClickListener(clickListener);
        holder.imageView.setOnClickListener(clickListener);

        holder.fileActionsImageView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mActivity.openContextMenu(view, file.uri);
            }
        });

        String filename = file.filename;
        long length = file.fileLength;

        // TODO Date not available now
        //Date date = null;

        holder.filenameView.setText(filename);

        int compoundDrawableInt = 0;
        int type = FileUtilities.getType(filename);

        switch (type) {
            case FileUtilities.DOC:
                compoundDrawableInt = R.drawable.writer;
                break;
            case FileUtilities.CALC:
                compoundDrawableInt = R.drawable.calc;
                break;
            case FileUtilities.DRAWING:
                compoundDrawableInt = R.drawable.draw;
                break;
            case FileUtilities.IMPRESS:
                compoundDrawableInt = R.drawable.impress;
                break;
            case FileUtilities.PDF:
                compoundDrawableInt = R.drawable.pdf;
                break;
        }

        // For PDFs, try to render a real first-page thumbnail so the
        // user can recognize documents visually instead of seeing the
        // generic PDF icon for everything. We cache it in a static LRU
        // cache keyed by the file URI so it survives across rebinds.
        // The render runs on a background thread so the UI does not jank.
        boolean renderedThumb = false;
        if (type == FileUtilities.PDF) {
            final String cacheKey = file.uri.toString();
            Bitmap cached = sThumbCache.get(cacheKey);
            if (cached != null) {
                holder.imageView.setImageBitmap(cached);
                holder.imageView.setScaleType(ImageView.ScaleType.FIT_CENTER);
                renderedThumb = true;
            } else {
                // Async render — fall back to the static icon while we work.
                final ImageView iv = holder.imageView;
                final Context ctx = mActivity;
                final View.OnClickListener orig = clickListener;
                iv.setTag(cacheKey);  // prevent stale bindings
                new Thread(() -> {
                    Bitmap bmp = renderPdfThumbnail(ctx, file.uri);
                    if (bmp != null) {
                        sThumbCache.put(cacheKey, bmp);
                        iv.post(() -> {
                            if (cacheKey.equals(iv.getTag())) {
                                iv.setImageBitmap(bmp);
                                iv.setScaleType(ImageView.ScaleType.FIT_CENTER);
                            }
                        });
                    }
                }).start();
            }
        }
        if (!renderedThumb && compoundDrawableInt != 0) {
            holder.imageView.setImageDrawable(ContextCompat.getDrawable(mActivity, compoundDrawableInt));
            holder.imageView.setScaleType(ImageView.ScaleType.FIT_CENTER);
        }

        // Date and Size field only exist when we are displaying items in a list.
        if (mActivity.isViewModeList()) {
            String size;
            String unit = "B";
            if (length < KB) {
                size = Long.toString(length);
            } else if (length < MB) {
                size = Long.toString(length / KB);
                unit = "KB";
            } else {
                size = Long.toString(length / MB);
                unit = "MB";
            }
            holder.fileSizeView.setText(size);
            holder.fileSizeUnitView.setText(unit);

            /* TODO Date not available now
            if (date != null) {
                SimpleDateFormat df = new SimpleDateFormat("dd MMM yyyy hh:ss");
                //TODO format date
                holder.fileDateView.setText(df.format(date));
            }
            */
        }
    }

    @Override
    public int getItemCount() {
        if (recentFiles.size() == 0) {
            mActivity.noRecentItemsTextView.setVisibility(View.VISIBLE);
        } else {
            mActivity.noRecentItemsTextView.setVisibility(View.GONE);
        }
        return recentFiles.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {

        TextView filenameView, fileSizeView, fileSizeUnitView/*, fileDateView*/;
        ImageView imageView, fileActionsImageView;

        ViewHolder(View itemView) {
            super(itemView);
            this.filenameView = itemView.findViewById(R.id.file_item_name);
            this.imageView = itemView.findViewById(R.id.file_item_icon);
            this.fileActionsImageView = itemView.findViewById(R.id.file_actions_button);
            // Check if view mode is List, only then initialise Size and Date field
            if (mActivity.isViewModeList()) {
                fileSizeView = itemView.findViewById(R.id.file_item_size);
                fileSizeUnitView = itemView.findViewById(R.id.file_item_size_unit);
                //fileDateView = itemView.findViewById(R.id.file_item_date);
            }
        }
    }
    /** Cache the name & size so that we don't have ask later. */
    private class RecentFile {
        public Uri uri;
        public String filename;
        public long fileLength;

        public RecentFile(Uri uri, String filename, long fileLength) {
            this.uri = uri;
            this.filename = filename;
            this.fileLength = fileLength;
        }
    }

    /** Render the first page of a PDF (given as a content:// or file:// URI)
     *  to a 256x340 Bitmap suitable for a thumbnail tile. Returns null on
     *  any failure. Caller is responsible for running this off the UI thread. */
    private static Bitmap renderPdfThumbnail(Context ctx, Uri uri) {
        ParcelFileDescriptor fd = null;
        PdfRenderer renderer = null;
        try {
            // For content:// URIs we use openFileDescriptor; for file:// we
            // can also use openFileDescriptor (it handles both).
            fd = ctx.getContentResolver().openFileDescriptor(uri, "r");
            if (fd == null) return null;
            renderer = new PdfRenderer(fd);
            if (renderer.getPageCount() <= 0) return null;
            PdfRenderer.Page page = renderer.openPage(0);
            int targetW = 256;
            int targetH = (int) Math.round(targetW * (page.getHeight() / (double) Math.max(1, page.getWidth())));
            if (targetH > 480) targetH = 480;
            Bitmap bmp = Bitmap.createBitmap(targetW, targetH, Bitmap.Config.ARGB_8888);
            bmp.eraseColor(Color.WHITE);
            page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
            page.close();
            return bmp;
        } catch (Throwable t) {
            return null;
        } finally {
            try { if (renderer != null) renderer.close(); } catch (Throwable ignored) {}
            try { if (fd != null) fd.close(); } catch (Throwable ignored) {}
        }
    }
}

/* vim:set shiftwidth=4 softtabstop=4 expandtab: */
