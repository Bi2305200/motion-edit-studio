import os
import json
import uuid
import time
import shutil
import zipfile
import subprocess

STUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACT_DIR = os.environ.get("DELIVER_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "deliver"))
SKILL_DIR = ARTIFACT_DIR
os.makedirs(ARTIFACT_DIR, exist_ok=True)

VIDEO_V3 = os.path.join(STUDIO_DIR, "out", "showcase_v3.mp4")
AUDIO_WAV = os.path.join(STUDIO_DIR, "public", "audio", "master_soundtrack_15s.wav")
FINAL_MP4 = os.path.join(STUDIO_DIR, "out", "motion_graphics_remotion_master.mp4")

# 1. Mux final MP4 with BT.709 color tags & 256k AAC audio
subprocess.run([
    "ffmpeg", "-y",
    "-i", VIDEO_V3,
    "-i", AUDIO_WAV,
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-c:v", "libx264",
    "-crf", "16",
    "-pix_fmt", "yuv420p",
    "-color_range", "tv",
    "-colorspace", "bt709",
    "-color_primaries", "bt709",
    "-color_trc", "bt709",
    "-c:a", "aac",
    "-b:a", "256k",
    "-movflags", "+faststart",
    "-shortest",
    FINAL_MP4
], check=True)

# Copy to Artifact dir & Scratch dir
shutil.copy2(FINAL_MP4, os.path.join(ARTIFACT_DIR, "motion_graphics_masterpiece.mp4"))
shutil.copy2(FINAL_MP4, os.path.join(SKILL_DIR, "motion_graphics_masterpiece.mp4"))

# Generate final verification contact sheet
subprocess.run([
    "ffmpeg", "-y",
    "-i", FINAL_MP4,
    "-vf", "fps=1,scale=360:-1,tile=5x3",
    "-frames:v", "1",
    "-update", "1",
    os.path.join(ARTIFACT_DIR, "final_remotion_contact_sheet.png")
], check=True)

# Generate cover thumbnail from frame 15 (0.5s)
cover_jpg = os.path.join(STUDIO_DIR, "out", "draft_cover.jpg")
subprocess.run([
    "ffmpeg", "-y",
    "-ss", "0.6",
    "-i", FINAL_MP4,
    "-frames:v", "1",
    "-q:v", "2",
    "-update", "1",
    cover_jpg
], check=True)
shutil.copy2(cover_jpg, os.path.join(ARTIFACT_DIR, "draft_cover.jpg"))

# 2. Slice 4 high-quality scene clips for CapCut PC multi-segment timeline
scenes_meta = [
    ("scene1_brutalist.mp4", 0.0, 3.6, "ĐỒ HỌA CHUYỂN ĐỘNG BRUTALIST", "Chuẩn khung Safe Zone TikTok 9:16"),
    ("scene2_kinetic.mp4", 3.6, 3.8, "NHỊP DỰNG BẮT TRỌN BEAT", "Spring Physics K=300 • 128 BPM"),
    ("scene3_spotify_ui.mp4", 7.4, 4.0, "SPOTIFY 2.0 GLASS UI CONCEPT", "Glassmorphism & Spatial Audio"),
    ("scene4_explainer.mp4", 11.4, 3.6, "HIỆU SUẤT DỰNG TĂNG GẤP 10 LẦN", "Vox Data Explainer • Remotion Engine"),
]

res_dir = os.path.join(STUDIO_DIR, "out", "capcut_resources")
os.makedirs(res_dir, exist_ok=True)

for fname, st, dur, _, _ in scenes_meta:
    out_clip = os.path.join(res_dir, fname)
    subprocess.run([
        "ffmpeg", "-y",
        "-ss", str(st),
        "-t", str(dur),
        "-i", VIDEO_V3,
        "-c:v", "libx264",
        "-crf", "16",
        "-pix_fmt", "yuv420p",
        "-g", "15",
        out_clip
    ], check=True)

shutil.copy2(AUDIO_WAV, os.path.join(res_dir, "master_soundtrack_15s.wav"))
shutil.copy2(AUDIO_WAV, os.path.join(ARTIFACT_DIR, "final_master_soundtrack.wav"))
for extra_audio in [
    "vo_s1.mp3", "vo_s2.mp3", "vo_s3.mp3", "vo_s4.mp3",
    "bgm_cat_walk.mp3", "bgm_207.mp3",
    "sfx_whoosh.mp3", "sfx_impact.mp3", "sfx_pop.mp3", "sfx_rise.mp3"
]:
    src_a = os.path.join(STUDIO_DIR, "public", "audio", extra_audio)
    if os.path.exists(src_a):
        shutil.copy2(src_a, os.path.join(res_dir, extra_audio))

# 3. Build CapCut PC Draft Project (15.0s = 15,000,000 microseconds)
def uid():
    return str(uuid.uuid4()).upper()

def build_draft_for_dir(draft_folder):
    os.makedirs(draft_folder, exist_ok=True)
    local_res = os.path.join(draft_folder, "Resources")
    os.makedirs(local_res, exist_ok=True)
    for f in os.listdir(res_dir):
        shutil.copy2(os.path.join(res_dir, f), os.path.join(local_res, f))
    shutil.copy2(cover_jpg, os.path.join(draft_folder, "draft_cover.jpg"))

    videos_mat = []
    audios_mat = []
    texts_mat = []
    speeds_mat = []
    canvases_mat = []

    video_segments = []
    text_segments = []
    audio_segments = []

    cur_us = 0
    for idx, (fname, st, dur, title_txt, sub_txt) in enumerate(scenes_meta):
        dur_us = int(round(dur * 1_000_000))
        clip_path = os.path.join(local_res, fname).replace("\\", "/")

        v_id = uid()
        sp_id = uid()
        cv_id = uid()

        videos_mat.append({
            "audio_fade": None,
            "category_id": "",
            "category_name": "local",
            "check_flag": 63487,
            "crop": {
                "lower_left_x": 0.0, "lower_left_y": 1.0,
                "lower_right_x": 1.0, "lower_right_y": 1.0,
                "upper_left_x": 0.0, "upper_left_y": 0.0,
                "upper_right_x": 1.0, "upper_right_y": 0.0
            },
            "crop_ratio": "free",
            "crop_scale": 1.0,
            "duration": dur_us,
            "First_frame_time": 0,
            "height": 1920,
            "width": 1080,
            "id": v_id,
            "local_material_id": "",
            "material_id": v_id,
            "material_name": fname,
            "media_path": "",
            "path": clip_path,
            "type": "video",
            "volume": 1.0
        })
        speeds_mat.append({"curve_speed": None, "id": sp_id, "mode": 0, "speed": 1.0, "type": "speed"})
        canvases_mat.append({"album_image": "", "blur": 0.0, "color": "", "id": cv_id, "image": "", "image_id": "", "image_name": "", "source_platform": 0, "team_id": "", "type": "canvas_color"})

        video_segments.append({
            "cartoon": False,
            "clip": {
                "alpha": 1.0,
                "flip": {"horizontal": False, "vertical": False},
                "rotation": 0.0,
                "scale": {"x": 1.0, "y": 1.0},
                "transform": {"x": 0.0, "y": 0.0}
            },
            "common_keyframes": [],
            "enable_adjust": True,
            "enable_color_curves": True,
            "enable_color_wheels": True,
            "enable_lut": True,
            "enable_smart_color_adjust": False,
            "extra_material_refs": [sp_id, cv_id],
            "group_id": "",
            "hdr_settings": {"intensity": 1.0, "mode": 1, "nits": 1000},
            "id": uid(),
            "intensifies_audio": False,
            "is_placeholder": False,
            "is_tone_modify": False,
            "keyframe_refs": [],
            "last_nonzero_volume": 1.0,
            "material_id": v_id,
            "render_index": 0,
            "reverse": False,
            "source_timerange": {"duration": dur_us, "start": 0},
            "speed": 1.0,
            "target_timerange": {"duration": dur_us, "start": cur_us},
            "template_id": "",
            "template_scene": "default",
            "track_attribute": 0,
            "track_render_index": 0,
            "uniform_scale": {"on": True, "value": 1.0},
            "visible": True,
            "volume": 1.0
        })

        # Editable Caption Text Layer inside Safe Zone (Y = -0.62 in CapCut coords)
        t_id = uid()
        content_json = json.dumps({
            "styles": [{
                "fill": {"content": {"solid": {"color": [1.0, 1.0, 1.0]}}},
                "font": {"id": "", "path": ""},
                "size": 11.0,
                "bold": True,
                "strokes": [{"content": {"solid": {"color": [0.05, 0.05, 0.07]}}, "width": 0.08}],
                "range": [0, len(sub_txt)]
            }],
            "text": sub_txt
        }, ensure_ascii=False)

        texts_mat.append({
            "add_type": 0,
            "alignment": 1,
            "background_alpha": 0.75,
            "background_color": "#0B0B0E",
            "background_height": 0.14,
            "background_horizontal_offset": 0.0,
            "background_round_radius": 0.25,
            "background_style": 1,
            "background_vertical_offset": 0.0,
            "background_width": 0.14,
            "bold_width": 0.0,
            "border_alpha": 1.0,
            "border_color": "#0B0B0E",
            "border_width": 0.08,
            "check_flag": 7,
            "combo_info": {"text_templates": []},
            "content": content_json,
            "fixed_height": -1.0,
            "fixed_width": -1.0,
            "font_category_id": "",
            "font_category_name": "",
            "font_id": "",
            "font_name": "",
            "font_path": "",
            "font_resource_id": "",
            "font_size": 11.0,
            "font_source_platform": 0,
            "font_team_id": "",
            "font_title": "none",
            "font_url": "",
            "fonts": [],
            "force_apply_line_max_width": False,
            "global_alpha": 1.0,
            "group_id": "",
            "has_shadow": True,
            "id": t_id,
            "initial_scale": 1.0,
            "inner_padding": -1.0,
            "is_rich_text": False,
            "italic_degree": 0,
            "ktv_color": "",
            "language": "",
            "layer_weight": 1,
            "letter_spacing": 0.0,
            "line_feed": 1,
            "line_max_width": 0.82,
            "line_spacing": 0.02,
            "multi_language_current": "none",
            "name": "",
            "original_size": [],
            "preset_category": "",
            "preset_category_id": "",
            "preset_has_set_alignment": False,
            "preset_id": "",
            "preset_index": 0,
            "preset_name": "",
            "recognize_task_id": "",
            "recognize_type": 0,
            "relevance_segment": [],
            "shadow_alpha": 0.8,
            "shadow_angle": -45.0,
            "shadow_color": "#000000",
            "shadow_distance": 5.0,
            "shadow_point": {"x": 0.636, "y": -0.636},
            "shadow_smoothing": 0.45,
            "shape_clip_x": False,
            "shape_clip_y": False,
            "style_name": "",
            "sub_type": 0,
            "subtitle_keywords": None,
            "text_alpha": 1.0,
            "text_color": "#FFFFFF",
            "text_curve": None,
            "text_preset_resource_id": "",
            "text_size": 24,
            "text_to_audio_ids": [],
            "tts_auto_update": False,
            "type": "text",
            "typesetting": 0,
            "underline": False,
            "underline_offset": 0.22,
            "underline_width": 0.05,
            "use_effect_default_color": True,
            "words": {"end_time": [], "start_time": [], "text": []}
        })

        text_segments.append({
            "cartoon": False,
            "clip": {
                "alpha": 1.0,
                "flip": {"horizontal": False, "vertical": False},
                "rotation": 0.0,
                "scale": {"x": 1.0, "y": 1.0},
                "transform": {"x": 0.0, "y": -0.52}
            },
            "common_keyframes": [],
            "enable_adjust": False,
            "extra_material_refs": [],
            "group_id": "",
            "id": uid(),
            "intensifies_audio": False,
            "is_placeholder": False,
            "is_tone_modify": False,
            "keyframe_refs": [],
            "last_nonzero_volume": 1.0,
            "material_id": t_id,
            "render_index": 14000 + idx,
            "reverse": False,
            "source_timerange": {"duration": dur_us, "start": 0},
            "speed": 1.0,
            "target_timerange": {"duration": dur_us, "start": cur_us},
            "template_id": "",
            "template_scene": "default",
            "track_attribute": 0,
            "track_render_index": 1,
            "uniform_scale": {"on": True, "value": 1.0},
            "visible": True,
            "volume": 1.0
        })

        cur_us += dur_us

    # Separate Audio Tracks for CapCut PC:
    # Track A1: Studio BGM 15s (so user can easily swap Suno track in CapCut)
    bgm_15s_path = os.path.join(local_res, "bgm_studio_15s.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-i", os.path.join(local_res, "bgm_cat_walk.mp3"),
        "-af", "atrim=start=14.5:duration=15.0,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.25,afade=t=out:st=14.2:d=0.8",
        "-c:a", "libmp3lame", "-b:a", "192k", bgm_15s_path
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def add_audio_segment(fname, disp_name, start_us, dur_us, vol, track_idx):
        a_id = uid()
        sp_id = uid()
        p = os.path.join(local_res, fname).replace("\\", "/")
        audios_mat.append({
            "app_id": 0, "category_id": "", "category_name": "local", "check_flag": 1,
            "duration": dur_us, "effect_id": "", "formula_id": "", "id": a_id,
            "intensifies_path": "", "local_material_id": a_id, "music_id": a_id,
            "name": disp_name, "path": p, "request_id": "", "resource_id": "",
            "search_id": "", "source_platform": 0, "team_id": "", "text_id": "",
            "tone_category_id": "", "tone_category_name": "", "tone_effect_id": "",
            "tone_effect_name": "", "tone_speaker": "", "tone_type": "",
            "type": "extract_music", "video_id": "", "wave_points": []
        })
        speeds_mat.append({"curve_speed": None, "id": sp_id, "mode": 0, "speed": 1.0, "type": "speed"})
        return {
            "cartoon": False, "clip": None, "common_keyframes": [], "enable_adjust": False,
            "extra_material_refs": [sp_id], "group_id": "", "id": uid(),
            "intensifies_audio": False, "is_placeholder": False, "is_tone_modify": False,
            "keyframe_refs": [], "last_nonzero_volume": vol, "material_id": a_id,
            "render_index": 0, "reverse": False,
            "source_timerange": {"duration": dur_us, "start": 0},
            "speed": 1.0, "target_timerange": {"duration": dur_us, "start": start_us},
            "template_id": "", "template_scene": "default", "track_attribute": 0,
            "track_render_index": track_idx, "uniform_scale": None, "visible": True, "volume": vol
        }

    # Track 3: ElevenLabs Adam Voiceover (4 independent segments)
    vo_segments = [
        add_audio_segment("vo_s1.mp3", "Voiceover - Scene 1", 100_000, 3_300_000, 1.0, 0),
        add_audio_segment("vo_s2.mp3", "Voiceover - Scene 2", 3_680_000, 3_600_000, 1.0, 0),
        add_audio_segment("vo_s3.mp3", "Voiceover - Scene 3", 7_500_000, 3_700_000, 1.0, 0),
        add_audio_segment("vo_s4.mp3", "Voiceover - Scene 4", 11_450_000, 2_850_000, 1.0, 0),
    ]

    # Track 4: Studio BGM Track (replaceable with Suno track in 1 click)
    bgm_segments = [
        add_audio_segment("bgm_studio_15s.mp3", "Studio BGM 130BPM (Drop Synced)", 0, 15_000_000, 0.55, 1),
    ]

    # Track 5: Studio SFX Track (Whooshes & Pops at Scene Cuts)
    sfx_segments = [
        add_audio_segment("sfx_whoosh.mp3", "SFX Whoosh 1", 10_000, 600_000, 0.8, 2),
        add_audio_segment("sfx_whoosh.mp3", "SFX Whoosh 2", 3_500_000, 600_000, 0.8, 2),
        add_audio_segment("sfx_whoosh.mp3", "SFX Whoosh 3", 7_300_000, 600_000, 0.8, 2),
        add_audio_segment("sfx_whoosh.mp3", "SFX Whoosh 4", 11_300_000, 600_000, 0.8, 2),
    ]

    draft_content = {
        "canvas_config": {"height": 1920, "ratio": "9:16", "width": 1080},
        "color_space": 0,
        "config": {
            "adjust_max_index": 1,
            "attachment_info": [],
            "combination_max_index": 1,
            "export_range": None,
            "extract_audio_last_index": 1,
            "lyrics_recognition_id": "",
            "lyrics_sync": True,
            "lyrics_taskinfo": [],
            "maintrack_adsorb": True,
            "material_save_mode": 0,
            "multi_language_current": "none",
            "multi_language_list": [],
            "multi_language_main": "none",
            "multi_language_mode": "none",
            "original_sound_last_index": 1,
            "record_audio_last_index": 1,
            "sticker_max_index": 1,
            "subtitle_keywords_config": None,
            "subtitle_recognition_id": "",
            "subtitle_sync": True,
            "subtitle_taskinfo": [],
            "system_font_list": [],
            "video_mute": False,
            "zoom_info_params": None
        },
        "cover": None,
        "create_time": int(time.time()),
        "duration": 15_000_000,
        "extra_info": None,
        "fps": 30.0,
        "free_render_index_mode_on": False,
        "group_container": None,
        "id": uid(),
        "keyframe_graph_list": [],
        "keyframes": {
            "adjusts": [], "audios": [], "effects": [], "filters": [],
            "handwrites": [], "stickers": [], "texts": [], "videos": []
        },
        "last_modified_platform": {
            "app_id": 359289, "app_source": "cc", "app_version": "9.8.0",
            "device_id": "antigravity_studio", "hard_disk_id": "",
            "mac_address": "", "os": "windows", "os_version": "10.0.26200"
        },
        "materials": {
            "ai_translates": [], "audio_balances": [], "audio_effects": [],
            "audio_fades": [], "audio_track_indexes": [], "audios": audios_mat,
            "beats": [], "canvases": canvases_mat, "chromas": [],
            "color_curves": [], "digital_humans": [], "drafts": [],
            "effects": [], "flowers": [], "green_screens": [], "handwrites": [],
            "hsl": [], "images": [], "log_color_wheels": [], "loudnesses": [],
            "manual_deformations": [], "masks": [], "material_animations": [],
            "material_colors": [], "multi_language_refs": [], "placeholders": [],
            "plugin_effects": [], "primary_color_wheels": [], "realtime_denoises": [],
            "shapes": [], "smart_crops": [], "smart_relights": [],
            "sound_channel_mappings": [], "speeds": speeds_mat, "stickers": [],
            "tail_leaders": [], "text_templates": [], "texts": texts_mat,
            "time_marks": [], "transitions": [], "video_effects": [],
            "video_trackings": [], "videos": videos_mat, "vocal_beautifys": [],
            "vocal_separations": []
        },
        "mutable_config": None,
        "name": "Motion_Graphics_Master_Draft",
        "new_version": "113.0.0",
        "platform": {
            "app_id": 359289, "app_source": "cc", "app_version": "9.8.0",
            "device_id": "antigravity_studio", "hard_disk_id": "",
            "mac_address": "", "os": "windows", "os_version": "10.0.26200"
        },
        "relationships": [],
        "render_index_track_mode_on": True,
        "retouch_cover": None,
        "source": "default",
        "static_cover_image_path": "",
        "time_marks": None,
        "tracks": [
            {"attribute": 0, "flag": 0, "id": uid(), "is_default_name": True, "name": "Video Scenes", "segments": video_segments, "type": "video"},
            {"attribute": 0, "flag": 0, "id": uid(), "is_default_name": True, "name": "Subtitles SafeZone", "segments": text_segments, "type": "text"},
            {"attribute": 0, "flag": 0, "id": uid(), "is_default_name": True, "name": "ElevenLabs Voiceover", "segments": vo_segments, "type": "audio"},
            {"attribute": 0, "flag": 0, "id": uid(), "is_default_name": True, "name": "Studio BGM (Suno Ready)", "segments": bgm_segments, "type": "audio"},
            {"attribute": 0, "flag": 0, "id": uid(), "is_default_name": True, "name": "Transition SFX", "segments": sfx_segments, "type": "audio"},
        ],
        "update_time": int(time.time()),
        "version": 360000
    }

    with open(os.path.join(draft_folder, "draft_content.json"), "w", encoding="utf-8") as f:
        json.dump(draft_content, f, ensure_ascii=False, indent=2)

    meta_info = {
        "cloud_package_completed_time": "",
        "draft_cloud_capcut_purchase_info": "",
        "draft_cloud_last_action_download": False,
        "draft_cloud_materials": [],
        "draft_cloud_purchase_info": "",
        "draft_cloud_template_id": "",
        "draft_cloud_tutorial_info": "",
        "draft_cloud_videocut_purchase_info": "",
        "draft_cover": "draft_cover.jpg",
        "draft_deeplink_url": "",
        "draft_enterprise_info": {"draft_enterprise_extra": "", "draft_enterprise_id": "", "draft_enterprise_name": "", "enterprise_material": []},
        "draft_fold_path": draft_folder.replace("\\", "/"),
        "draft_id": draft_content["id"],
        "draft_is_ai_packaging_used": False,
        "draft_is_ai_shorts": False,
        "draft_is_ai_translate": False,
        "draft_is_article_video_draft": False,
        "draft_is_from_deeplink": "false",
        "draft_is_invisible": False,
        "draft_materials": [{"type": 0, "value": []}, {"type": 1, "value": []}, {"type": 2, "value": []}, {"type": 3, "value": []}, {"type": 6, "value": []}, {"type": 7, "value": []}, {"type": 8, "value": []}],
        "draft_materials_copied_info": [],
        "draft_name": "Motion_Graphics_Master_Draft",
        "draft_new_version": "",
        "draft_removable_storage_device": "D:",
        "draft_root_path": os.path.dirname(draft_folder).replace("\\", "/"),
        "draft_segment_extra_info": [],
        "draft_timeline_materials_size_": 0,
        "draft_type": "",
        "tm_draft_cloud_completed": "",
        "tm_draft_cloud_modified": 0,
        "tm_draft_create": int(time.time() * 1_000_000),
        "tm_draft_modified": int(time.time() * 1_000_000),
        "tm_draft_removed": 0,
        "tm_duration": 15_000_000
    }
    with open(os.path.join(draft_folder, "draft_meta_info.json"), "w", encoding="utf-8") as f:
        json.dump(meta_info, f, ensure_ascii=False, indent=2)

# Deploy to both D:\CapCut Drafts and AppData CapCut Drafts
draft_targets = [
    r"D:\CapCut Drafts\Motion_Graphics_Master_Draft",
    r"C:\Users\Admin\AppData\Local\CapCut\User Data\Projects\com.lveditor.draft\Motion_Graphics_Master_Draft"
]
for target in draft_targets:
    try:
        build_draft_for_dir(target)
        print("Updated CapCut Draft at:", target)
    except Exception as e:
        print("Draft target warning:", target, e)

# Create Portable ZIP Archive
zip_out = os.path.join(ARTIFACT_DIR, "Motion_Graphics_Master_Draft.zip")
with zipfile.ZipFile(zip_out, "w", zipfile.ZIP_DEFLATED) as zf:
    base = draft_targets[0]
    for root, _, files in os.walk(base):
        for file in files:
            full = os.path.join(root, file)
            rel = os.path.relpath(full, os.path.dirname(base))
            zf.write(full, rel)
if os.path.abspath(SKILL_DIR) != os.path.abspath(ARTIFACT_DIR):
    shutil.copy2(zip_out, os.path.join(SKILL_DIR, "Motion_Graphics_Master_Draft.zip"))
print("Created portable ZIP:", zip_out)

