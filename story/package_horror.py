"""
Đóng gói video hoàn chỉnh 'PHÒNG TRỌ 1,5 TRIỆU':
  1. Mux Remotion video (out/horror_story_raw.mp4) + Master Audio (story/horror_master_audio.wav)
     với BT.709 + AAC 256k + faststart -> out/phong_tro_1tr5_tiktok.mp4
  2. Copy video & tạo contact sheet + ảnh bìa vào thư mục artifacts
  3. Tạo CapCut PC Draft tách 4 track (9 cảnh Video, Voiceover Adam, Nền Drone kinh dị, SFX/Foley)

Chạy: python story/package_horror.py
"""
import os, json, uuid, time, shutil, zipfile, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\57e8b0e9-0669-4cd0-9760-c9c078d347d9"

RAW_MP4 = os.path.join(ROOT, "out", "horror_story_raw.mp4")
MASTER_WAV = os.path.join(HERE, "horror_master_audio.wav")
FINAL_MP4 = os.path.join(ROOT, "out", "phong_tro_1tr5_tiktok.mp4")


def uid():
    return str(uuid.uuid4()).upper()


def mux_final():
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", RAW_MP4, "-i", MASTER_WAV,
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
        "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest",
        FINAL_MP4,
    ], check=True)
    shutil.copy2(FINAL_MP4, os.path.join(ARTIFACT_DIR, "phong_tro_1tr5_tiktok.mp4"))

    # Cover tại frame hook 'ĐÊM THỨ 3' (~3.4s)
    cover = os.path.join(ROOT, "out", "horror_cover.jpg")
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error",
        "-ss", "3.4", "-i", FINAL_MP4, "-frames:v", "1", "-q:v", "2", "-update", "1", cover,
    ], check=True)
    shutil.copy2(cover, os.path.join(ARTIFACT_DIR, "horror_cover.jpg"))

    # Contact sheet 12 khung (mỗi ~18 giây 1 ảnh -> grid 4x3)
    sheet = os.path.join(ARTIFACT_DIR, "horror_contact_sheet.png")
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", FINAL_MP4,
        "-vf", "fps=1/18,scale=360:-1,tile=4x3",
        "-frames:v", "1", "-update", "1", sheet,
    ], check=True)
    return cover


def build_capcut_draft(cover):
    tl = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf-8"))
    M = tl["marks"]
    total = tl["total"]
    total_us = int(round(total * 1_000_000))

    # Cắt 9 cảnh video sạch (dùng stream copy/keyframe seek để chỉnh nhanh trong CapCut)
    cuts = [
        ("01_hook.mp4", 0.0, M["p1"]),
        ("02_tim_tro.mp4", M["p1"], M["p2"]),
        ("03_can_phong.mp4", M["p2"], M["p3"]),
        ("04_dem_thu_ba.mp4", M["p3"], M["p4"]),
        ("05_tieng_go.mp4", M["p4"], M["p5"]),
        ("06_gieng_troi.mp4", M["p5"], M["p6"]),
        ("07_bong_ban_tay.mp4", M["p6"], M["p8"]),
        ("08_sang_hom_sau.mp4", M["p8"], M["vo_end"]),
        ("09_end_card.mp4", M["vo_end"], total),
    ]

    res_stage = os.path.join(ROOT, "out", "horror_capcut_res")
    os.makedirs(res_stage, exist_ok=True)
    clips = []
    for fname, a, b in cuts:
        dur = round(b - a, 3)
        out_p = os.path.join(res_stage, fname)
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error",
            "-ss", str(a), "-t", str(dur), "-i", RAW_MP4,
            "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", "-g", "15",
            out_p,
        ], check=True)
        clips.append((fname, a, dur))

    shutil.copy2(os.path.join(HERE, "audio_stems", "stem_drone.wav"), os.path.join(res_stage, "stem_drone.wav"))
    shutil.copy2(os.path.join(HERE, "audio_stems", "stem_sfx.wav"), os.path.join(res_stage, "stem_sfx.wav"))
    for v in tl["vo"]:
        shutil.copy2(os.path.join(ROOT, v["file"]), os.path.join(res_stage, f"{v['id']}.mp3"))

    draft_name = "Phong_Tro_1tr5_TikTok"
    targets = [
        os.path.join(r"D:\CapCut Drafts", draft_name),
        os.path.join(r"C:\Users\Admin\AppData\Local\CapCut\User Data\Projects\com.lveditor.draft", draft_name),
    ]

    for folder in targets:
        try:
            os.makedirs(folder, exist_ok=True)
            local_res = os.path.join(folder, "Resources")
            os.makedirs(local_res, exist_ok=True)
            for f in os.listdir(res_stage):
                shutil.copy2(os.path.join(res_stage, f), os.path.join(local_res, f))
            shutil.copy2(cover, os.path.join(folder, "draft_cover.jpg"))

            videos_mat, audios_mat, speeds_mat, canvases_mat = [], [], [], []
            video_segs, vo_segs, drone_segs, sfx_segs = [], [], [], []

            for fname, start_sec, dur_sec in clips:
                dur_us = int(round(dur_sec * 1_000_000))
                st_us = int(round(start_sec * 1_000_000))
                v_id, sp_id, cv_id = uid(), uid(), uid()
                videos_mat.append({
                    "audio_fade": None, "category_id": "", "category_name": "local", "check_flag": 63487,
                    "crop": {"lower_left_x": 0.0, "lower_left_y": 1.0, "lower_right_x": 1.0, "lower_right_y": 1.0,
                             "upper_left_x": 0.0, "upper_left_y": 0.0, "upper_right_x": 1.0, "upper_right_y": 0.0},
                    "crop_ratio": "free", "crop_scale": 1.0, "duration": dur_us, "First_frame_time": 0,
                    "height": 1920, "width": 1080, "id": v_id, "local_material_id": "", "material_id": v_id,
                    "material_name": fname, "media_path": "",
                    "path": os.path.join(local_res, fname).replace("\\", "/"),
                    "type": "video", "volume": 1.0,
                })
                speeds_mat.append({"curve_speed": None, "id": sp_id, "mode": 0, "speed": 1.0, "type": "speed"})
                canvases_mat.append({"album_image": "", "blur": 0.0, "color": "", "id": cv_id, "image": "",
                                     "image_id": "", "image_name": "", "source_platform": 0, "team_id": "", "type": "canvas_color"})
                video_segs.append({
                    "cartoon": False,
                    "clip": {"alpha": 1.0, "flip": {"horizontal": False, "vertical": False}, "rotation": 0.0,
                             "scale": {"x": 1.0, "y": 1.0}, "transform": {"x": 0.0, "y": 0.0}},
                    "common_keyframes": [], "enable_adjust": True, "enable_color_curves": True,
                    "enable_color_wheels": True, "enable_lut": True, "enable_smart_color_adjust": False,
                    "extra_material_refs": [sp_id, cv_id], "group_id": "",
                    "hdr_settings": {"intensity": 1.0, "mode": 1, "nits": 1000}, "id": uid(),
                    "intensifies_audio": False, "is_placeholder": False, "is_tone_modify": False,
                    "keyframe_refs": [], "last_nonzero_volume": 1.0, "material_id": v_id, "render_index": 0,
                    "reverse": False, "source_timerange": {"duration": dur_us, "start": 0}, "speed": 1.0,
                    "target_timerange": {"duration": dur_us, "start": st_us}, "template_id": "",
                    "template_scene": "default", "track_attribute": 0, "track_render_index": 0,
                    "uniform_scale": {"on": True, "value": 1.0}, "visible": True, "volume": 1.0,
                })

            def add_audio(fname, disp, start_us, dur_us, vol, tr_idx):
                a_id, sp_id = uid(), uid()
                audios_mat.append({
                    "app_id": 0, "category_id": "", "category_name": "local", "check_flag": 1,
                    "duration": dur_us, "effect_id": "", "formula_id": "", "id": a_id,
                    "intensifies_path": "", "local_material_id": a_id, "music_id": a_id,
                    "name": disp, "path": os.path.join(local_res, fname).replace("\\", "/"),
                    "request_id": "", "resource_id": "", "search_id": "", "source_platform": 0,
                    "team_id": "", "text_id": "", "tone_category_id": "", "tone_category_name": "",
                    "tone_effect_id": "", "tone_effect_name": "", "tone_speaker": "", "tone_type": "",
                    "type": "extract_music", "video_id": "", "wave_points": [],
                })
                speeds_mat.append({"curve_speed": None, "id": sp_id, "mode": 0, "speed": 1.0, "type": "speed"})
                return {
                    "cartoon": False, "clip": None, "common_keyframes": [], "enable_adjust": False,
                    "extra_material_refs": [sp_id], "group_id": "", "id": uid(),
                    "intensifies_audio": False, "is_placeholder": False, "is_tone_modify": False,
                    "keyframe_refs": [], "last_nonzero_volume": vol, "material_id": a_id,
                    "render_index": 0, "reverse": False,
                    "source_timerange": {"duration": dur_us, "start": 0}, "speed": 1.0,
                    "target_timerange": {"duration": dur_us, "start": start_us},
                    "template_id": "", "template_scene": "default", "track_attribute": 0,
                    "track_render_index": tr_idx, "uniform_scale": None, "visible": True, "volume": vol,
                }

            for v in tl["vo"]:
                vo_segs.append(add_audio(f"{v['id']}.mp3", f"Adam VO - {v['id'].upper()}",
                                         int(round(v["start"] * 1_000_000)), int(round(v["dur"] * 1_000_000)), 1.0, 0))
            drone_segs.append(add_audio("stem_drone.wav", "Horror Drone Bed", 0, total_us, 0.75, 1))
            sfx_segs.append(add_audio("stem_sfx.wav", "Horror Foley & SFX", 0, total_us, 1.0, 2))

            draft_id = uid()
            content = {
                "canvas_config": {"height": 1920, "ratio": "9:16", "width": 1080},
                "color_space": 0,
                "config": {"adjust_max_index": 1, "attachment_info": [], "combination_max_index": 1,
                           "export_range": None, "extract_audio_last_index": 1, "lyrics_recognition_id": "",
                           "lyrics_sync": True, "lyrics_taskinfo": [], "maintrack_adsorb": True, "material_save_mode": 0,
                           "multi_language_current": "none", "multi_language_list": [], "multi_language_main": "none",
                           "multi_language_mode": "none", "original_sound_last_index": 1, "record_audio_last_index": 1,
                           "sticker_max_index": 1, "subtitle_keywords_config": None, "subtitle_recognition_id": "",
                           "subtitle_sync": True, "subtitle_taskinfo": [], "system_font_list": [],
                           "video_mute": False, "zoom_info_params": None},
                "cover": None, "create_time": int(time.time()), "duration": total_us, "extra_info": None,
                "fps": 30.0, "free_render_index_mode_on": False, "group_container": None, "id": draft_id,
                "keyframe_graph_list": [],
                "keyframes": {"adjusts": [], "audios": [], "effects": [], "filters": [],
                              "handwrites": [], "stickers": [], "texts": [], "videos": []},
                "last_modified_platform": {"app_id": 359289, "app_source": "cc", "app_version": "9.8.0",
                                           "device_id": "antigravity_studio", "hard_disk_id": "", "mac_address": "",
                                           "os": "windows", "os_version": "10.0.26200"},
                "materials": {"ai_translates": [], "audio_balances": [], "audio_effects": [], "audio_fades": [],
                              "audio_track_indexes": [], "audios": audios_mat, "beats": [], "canvases": canvases_mat,
                              "chromas": [], "color_curves": [], "digital_humans": [], "drafts": [], "effects": [],
                              "flowers": [], "green_screens": [], "handwrites": [], "hsl": [], "images": [],
                              "log_color_wheels": [], "loudnesses": [], "manual_deformations": [], "masks": [],
                              "material_animations": [], "material_colors": [], "multi_language_refs": [],
                              "placeholders": [], "plugin_effects": [], "primary_color_wheels": [],
                              "realtime_denoises": [], "shapes": [], "smart_crops": [], "smart_relights": [],
                              "sound_channel_mappings": [], "speeds": speeds_mat, "stickers": [], "tail_leaders": [],
                              "text_templates": [], "texts": [], "time_marks": [], "transitions": [],
                              "video_effects": [], "video_trackings": [], "videos": videos_mat,
                              "vocal_beautifys": [], "vocal_separations": []},
                "mutable_config": None, "name": draft_name, "new_version": "113.0.0",
                "platform": {"app_id": 359289, "app_source": "cc", "app_version": "9.8.0",
                             "device_id": "antigravity_studio", "hard_disk_id": "", "mac_address": "",
                             "os": "windows", "os_version": "10.0.26200"},
                "relationships": [], "render_index_track_mode_on": True, "retouch_cover": None,
                "source": "default", "static_cover_image_path": "", "time_marks": None,
                "tracks": [
                    {"attribute": 0, "flag": 0, "id": uid(), "is_default_name": True, "name": "9 Horror Scenes", "segments": video_segs, "type": "video"},
                    {"attribute": 0, "flag": 0, "id": uid(), "is_default_name": True, "name": "Adam Voiceover", "segments": vo_segs, "type": "audio"},
                    {"attribute": 0, "flag": 0, "id": uid(), "is_default_name": True, "name": "Horror Drone Bed", "segments": drone_segs, "type": "audio"},
                    {"attribute": 0, "flag": 0, "id": uid(), "is_default_name": True, "name": "SFX & Foley", "segments": sfx_segs, "type": "audio"},
                ],
                "update_time": int(time.time()), "version": 360000,
            }
            with open(os.path.join(folder, "draft_content.json"), "w", encoding="utf-8") as f:
                json.dump(content, f, ensure_ascii=False, indent=2)

            meta = {
                "cloud_package_completed_time": "", "draft_cloud_capcut_purchase_info": "",
                "draft_cloud_last_action_download": False, "draft_cloud_materials": [],
                "draft_cloud_purchase_info": "", "draft_cloud_template_id": "",
                "draft_cloud_tutorial_info": "", "draft_cloud_videocut_purchase_info": "",
                "draft_cover": "draft_cover.jpg", "draft_deeplink_url": "",
                "draft_enterprise_info": {"draft_enterprise_extra": "", "draft_enterprise_id": "",
                                          "draft_enterprise_name": "", "enterprise_material": []},
                "draft_fold_path": folder.replace("\\", "/"), "draft_id": draft_id,
                "draft_is_ai_packaging_used": False, "draft_is_ai_shorts": False,
                "draft_is_ai_translate": False, "draft_is_article_video_draft": False,
                "draft_is_from_deeplink": "false", "draft_is_invisible": False,
                "draft_materials": [{"type": i, "value": []} for i in [0, 1, 2, 3, 6, 7, 8]],
                "draft_materials_copied_info": [], "draft_name": draft_name, "draft_new_version": "",
                "draft_removable_storage_device": "D:",
                "draft_root_path": os.path.dirname(folder).replace("\\", "/"),
                "draft_segment_extra_info": [], "draft_timeline_materials_size_": 0, "draft_type": "",
                "tm_draft_cloud_completed": "", "tm_draft_cloud_modified": 0,
                "tm_draft_create": int(time.time() * 1_000_000),
                "tm_draft_modified": int(time.time() * 1_000_000),
                "tm_draft_removed": 0, "tm_duration": total_us,
            }
            with open(os.path.join(folder, "draft_meta_info.json"), "w", encoding="utf-8") as f:
                json.dump(meta, f, ensure_ascii=False, indent=2)
            print("Updated CapCut Draft:", folder)
        except Exception as e:
            print("CapCut warning:", folder, e)


if __name__ == "__main__":
    cov = mux_final()
    build_capcut_draft(cov)
    print("Đóng gói xong:", FINAL_MP4)
